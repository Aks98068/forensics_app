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

	router.GET(
		"/health",
		func(c *gin.Context) {
			c.JSON(
				http.StatusOK,
				gin.H{
					"status": "ok",
				},
			)
		},
	)

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
	auth.POST("/resend-verification", authHandler.ResendVerificationEmail)

	auth.POST("/login", authHandler.Login)
	auth.POST("/refresh", authHandler.Refresh)
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

	userRoutes.GET(
		"/me",
		userHandler.Me,
	)

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

	// Future:
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

	// Future:
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
	//
	// Anything that is not an API route goes to Next.js.
	//
	// Examples:
	//
	// /
	// /register
	// /login
	// /about
	// /_next/static/*
	// /_next/image/*
	// /favicon.ico
	// /images/*
	//
	// IMPORTANT:
	// This must stay AFTER the API routes.
	// ============================================================

	nextHandler, err := newNextProxy(cfg.NextURL)

	if err != nil {
		return err
	}

	router.NoRoute(nextHandler)

	return nil
}

// ============================================================
// NEXT.JS REVERSE PROXY
// ============================================================

func newNextProxy(rawURL string) (gin.HandlerFunc, error) {

	rawURL = strings.TrimSpace(rawURL)

	if rawURL == "" {
		return nil, fmt.Errorf(
			"next.js url is empty",
		)
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
	//
	// Preserve the original browser request information while
	// forwarding the actual request to Next.js.
	// ============================================================

	originalDirector := proxy.Director

	proxy.Director = func(req *http.Request) {

		originalDirector(req)

		// Preserve the public host.
		//
		// Browser:
		// https://edutechpro.online
		//
		// Next.js internally:
		// http://127.0.0.1:3001
		//
		// Next.js should know the original public host.
		if host := req.Header.Get("X-Forwarded-Host"); host != "" {
			req.Host = host
		}

		// Forward the original protocol.
		if proto := req.Header.Get("X-Forwarded-Proto"); proto != "" {
			req.Header.Set(
				"X-Forwarded-Proto",
				proto,
			)
		}

		// Tell Next.js which server the request originally came from.
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

		w.WriteHeader(
			http.StatusBadGateway,
		)

		_, _ = w.Write(
			[]byte(`{"error":"frontend is not available"}`),
		)
	}

	// ============================================================
	// FRONTEND HANDLER
	// ============================================================

	return func(c *gin.Context) {

		path := c.Request.URL.Path

		// Unknown API routes must NOT be sent to Next.js.
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

		// These all go through the same proxy:
		//
		// /
		// /register
		// /login
		// /_next/static/*
		// /_next/image/*
		// /favicon.ico
		// etc.

		proxy.ServeHTTP(
			c.Writer,
			c.Request,
		)
	}, nil
}