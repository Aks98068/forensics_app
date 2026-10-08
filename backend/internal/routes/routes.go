package routes

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/Aks98068/forensics/internal/handlres"
	middleware "github.com/Aks98068/forensics/internal/middlewares"
	"github.com/Aks98068/forensics/internal/models"

	"github.com/gin-gonic/gin"
)

type Config struct {
	JWTAccessSecret string
	JWTIssuer       string
	JWTAudience     string

	// Internal Next.js server.
	// Example:
	// http://127.0.0.1:3001
	NextURL string
}

func Routes(
	router *gin.Engine,
	authHandler *handlres.AuthHandler,
	userHandler *handlres.UserHandler,
	cfg *Config,
) error {

	// ============================================================
	// HEALTH CHECK
	// ============================================================

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// ============================================================
	// API V1
	// ============================================================

	api := router.Group("/api/v1")

	// ============================================================
	// AUTH
	// ============================================================

	auth := api.Group("/auth")

	auth.POST("/register", authHandler.Register)
	auth.POST("/verify-email", authHandler.VerifyEmail)
	auth.POST(
		"/resend-verification",
		authHandler.ResendVerificationEmail,
	)

	auth.POST("/login", authHandler.Login)
	auth.POST("/refresh", authHandler.Refresh)

	// IMPORTANT:
	// Logout remains an API POST endpoint.
	auth.POST("/logout", authHandler.Logout)

	auth.POST("/forgot-password", authHandler.ForgotPassword)
	auth.POST("/reset-password", authHandler.ResetPassword)

	// ============================================================
	// PROTECTED API
	// ============================================================

	protected := api.Group("/protected")

	protected.Use(
		middleware.JWTAuthMiddleware(
			middleware.JWTAuthConfig{
				AccessSecret: cfg.JWTAccessSecret,
				Issuer:       cfg.JWTIssuer,
				Audience:     cfg.JWTAudience,
			},
		),
	)

	// ============================================================
	// USER
	// ============================================================

	userRoutes := protected.Group("/user")

	userRoutes.Use(
		middleware.RequireRoles(
			models.RoleUser,
			models.RoleAnalyst,
			models.RoleAdmin,
		),
	)

	userRoutes.GET("/me", userHandler.Me)

	// ============================================================
	// ANALYST
	// ============================================================

	analystRoutes := protected.Group("/analyst")

	analystRoutes.Use(
		middleware.RequireRoles(
			models.RoleAnalyst,
			models.RoleAdmin,
		),
	)

	// Future analyst endpoints:
	//
	// analystRoutes.GET("/cases", ...)
	// analystRoutes.GET("/evidence", ...)
	// analystRoutes.GET("/reports", ...)

	_ = analystRoutes

	// ============================================================
	// ADMIN
	// ============================================================

	adminRoutes := protected.Group("/admin")

	adminRoutes.Use(
		middleware.RequireRoles(
			models.RoleAdmin,
		),
	)

	// Future admin endpoints:
	//
	// adminRoutes.GET("/users", ...)
	// adminRoutes.GET("/cases", ...)
	// adminRoutes.GET("/evidence", ...)
	// adminRoutes.GET("/reports", ...)
	// adminRoutes.GET("/audit-logs", ...)
	// adminRoutes.GET("/settings", ...)

	_ = adminRoutes

	// ============================================================
	// NEXT.JS FRONTEND
	// ============================================================

	nextHandler, err := newNextProxy(cfg.NextURL)

	if err != nil {
		return err
	}

	// ============================================================
	// IMPORTANT
	// ============================================================
	//
	// We intentionally DO NOT create:
	//
	// router.GET("/logout", ...)
	//
	// because logout is handled by:
	//
	// POST /api/v1/auth/logout
	//
	// The dashboard frontend calls that endpoint directly.
	//
	// ============================================================

	router.NoRoute(nextHandler)

	return nil
}

// ============================================================
// NEXT.JS REVERSE PROXY
// ============================================================

func newNextProxy(rawURL string) (gin.HandlerFunc, error) {

	rawURL = strings.TrimSpace(rawURL)

	if rawURL == "" {
		return nil, fmt.Errorf("next.js url is empty")
	}

	target, err := url.Parse(rawURL)

	if err != nil {
		return nil, fmt.Errorf(
			"invalid next.js url %q: %w",
			rawURL,
			err,
		)
	}

	if target.Scheme == "" || target.Host == "" {
		return nil, fmt.Errorf(
			"invalid next.js url %q: need scheme and host",
			rawURL,
		)
	}

	log.Printf(
		"proxying frontend requests to Next.js at %s",
		target.String(),
	)

	proxy := httputil.NewSingleHostReverseProxy(target)

	// ============================================================
	// DIRECTOR
	// ============================================================

	originalDirector := proxy.Director

	proxy.Director = func(req *http.Request) {

		originalDirector(req)

		// Preserve public host.
		if host := req.Header.Get("X-Forwarded-Host"); host != "" {
			req.Host = host
		}

		// Preserve original protocol.
		if proto := req.Header.Get("X-Forwarded-Proto"); proto != "" {
			req.Header.Set(
				"X-Forwarded-Proto",
				proto,
			)
		}

		// Preserve original client IP.
		if req.Header.Get("X-Forwarded-For") == "" {
			req.Header.Set(
				"X-Forwarded-For",
				req.RemoteAddr,
			)
		}
	}

	// ============================================================
	// ERROR HANDLER
	// ============================================================

	proxy.ErrorHandler = func(
		w http.ResponseWriter,
		r *http.Request,
		err error,
	) {

		log.Printf(
			"Next.js proxy error: method=%s path=%s error=%v",
			r.Method,
			r.URL.Path,
			err,
		)

		w.Header().Set(
			"Content-Type",
			"application/json; charset=utf-8",
		)

		w.WriteHeader(http.StatusBadGateway)

		_, _ = w.Write(
			[]byte(`{"error":"frontend is not available"}`),
		)
	}

	// ============================================================
	// FRONTEND HANDLER
	// ============================================================

	return func(c *gin.Context) {

		path := c.Request.URL.Path

		// ========================================================
		// NEVER PROXY UNKNOWN API ROUTES TO NEXT.JS
		// ========================================================

		if path == "/api" ||
			strings.HasPrefix(path, "/api/") {

			c.JSON(
				http.StatusNotFound,
				gin.H{
					"error": "API endpoint not found",
				},
			)

			return
		}

		// ========================================================
		// FRONTEND REQUEST
		// ========================================================

		proxy.ServeHTTP(
			c.Writer,
			c.Request,
		)
	}, nil
}
