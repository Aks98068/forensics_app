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
	"github.com/Aks98068/forensics/internal/security"

	"github.com/gin-gonic/gin"
)

type Config struct {
	JWTAccessSecret string
	JWTIssuer       string
	JWTAudience     string
	NextURL         string
}

func Routes(
	router *gin.Engine,
	authHandler *handlres.AuthHandler,
	userHandler *handlres.UserHandler,
	cfg *Config,
) error {
	if router == nil {
		return fmt.Errorf("router must not be nil")
	}

	if authHandler == nil {
		return fmt.Errorf("auth handler must not be nil")
	}

	if userHandler == nil {
		return fmt.Errorf("user handler must not be nil")
	}

	if cfg == nil {
		return fmt.Errorf("routes config must not be nil")
	}

	if strings.TrimSpace(cfg.JWTAccessSecret) == "" {
		return fmt.Errorf("JWT access secret must not be empty")
	}

	// Health check.
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// API v1.
	api := router.Group("/api/v1")

	// Authentication routes.
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/verify-email", authHandler.VerifyEmail)
		auth.POST(
			"/resend-verification",
			authHandler.ResendVerificationEmail,
		)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.Refresh)
		auth.POST("/logout", authHandler.Logout)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)
	}

	// Resolve JWT validation settings.
	issuer := strings.TrimSpace(cfg.JWTIssuer)
	if issuer == "" {
		issuer = security.JWTIssuer
	}

	audience := strings.TrimSpace(cfg.JWTAudience)
	if audience == "" {
		audience = security.JWTAudience
	}

	// Protected API: JWT authentication is required.
	protected := api.Group("/protected")
	protected.Use(
		middleware.JWTAuthMiddleware(
			middleware.JWTAuthConfig{
				AccessSecret: cfg.JWTAccessSecret,
				Issuer:       security.JWTIssuer,
				Audience:     security.JWTAudience,
			},
		),
	)

	// Shared current-user endpoint.
	// USER is the backend role displayed as Investigator in the UI.
	userRoutes := protected.Group("/user")
	userRoutes.Use(
		middleware.RequireRoles(
			models.RoleUser,
			models.RoleAnalyst,
			models.RoleAdmin,
		),
	)
	userRoutes.GET("/me", userHandler.Me)

	// Analyst endpoints.
	analystRoutes := protected.Group("/analyst")
	analystRoutes.Use(
		middleware.RequireRoles(
			models.RoleAnalyst,
			models.RoleAdmin,
		),
	)
	analystRoutes.GET("/me", userHandler.Me)

	// Admin endpoints.
	adminRoutes := protected.Group("/admin")
	adminRoutes.Use(
		middleware.RequireRoles(models.RoleAdmin),
	)
	adminRoutes.GET("/me", userHandler.Me)

	// Initialize the Next.js reverse proxy.
	nextHandler, err := newNextProxy(cfg.NextURL)
	if err != nil {
		return fmt.Errorf("initialize Next.js proxy: %w", err)
	}

	// Unknown API routes must return API 404 responses, not frontend pages.
	// Other unmatched routes are served by Next.js.
	router.NoRoute(nextHandler)

	return nil
}

// newNextProxy forwards unmatched frontend requests to Next.js.
func newNextProxy(rawURL string) (gin.HandlerFunc, error) {
	rawURL = strings.TrimSpace(rawURL)
	if rawURL == "" {
		return nil, fmt.Errorf("Next.js URL is empty")
	}

	target, err := url.Parse(rawURL)
	if err != nil {
		return nil, fmt.Errorf("invalid Next.js URL %q: %w", rawURL, err)
	}

	if (target.Scheme != "http" && target.Scheme != "https") ||
		target.Host == "" ||
		target.User != nil {
		return nil, fmt.Errorf(
			"invalid Next.js URL %q: expected an HTTP(S) URL with a host",
			rawURL,
		)
	}

	log.Printf("proxying frontend requests to Next.js at %s", target.Redacted())

	proxy := httputil.NewSingleHostReverseProxy(target)
	originalDirector := proxy.Director

	proxy.Director = func(req *http.Request) {
		originalDirector(req)

		// Preserve the original public host only when supplied by a
		// trusted reverse proxy. Configure trusted proxies at the Gin layer.
		if host := req.Header.Get("X-Forwarded-Host"); host != "" {
			req.Host = host
		}

		if proto := req.Header.Get("X-Forwarded-Proto"); proto != "" {
			req.Header.Set("X-Forwarded-Proto", proto)
		}

		if forwardedFor := req.Header.Get("X-Forwarded-For"); forwardedFor == "" {
			req.Header.Set("X-Forwarded-For", req.RemoteAddr)
		}
	}

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

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"error":"frontend is not available"}`))
	}

	return func(c *gin.Context) {
		path := c.Request.URL.Path

		if path == "/api" || strings.HasPrefix(path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "API endpoint not found",
			})
			return
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	}, nil
}
