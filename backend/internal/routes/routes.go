package routes

import (
	"net/http"

	"github.com/Aks98068/forensics/internal/frontend"
	"github.com/Aks98068/forensics/internal/handlres"
	middleware "github.com/Aks98068/forensics/internal/middlewares"
	"github.com/Aks98068/forensics/internal/models"

	"github.com/gin-gonic/gin"
)

type Config struct {
	JWTAccessSecret string
	JWTIssuer       string
	JWTAudience     string
}

func Routes(
	router *gin.Engine,
	authHandler *handlres.AuthHandler,
	userHandler *handlres.UserHandler,
	frontendRenderer *frontend.Renderer,
	cfg *Config,
) {

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

	api := router.Group(
		"/api/v1",
	)

	// ============================================================
	// AUTH ROUTES
	// ============================================================

	auth := api.Group(
		"/auth",
	)

	auth.POST(
		"/register",
		authHandler.Register,
	)

	auth.POST(
		"/verify-email",
		authHandler.VerifyEmail,
	)

	auth.POST(
		"/resend-verification",
		authHandler.ResendVerificationEmail,
	)

	auth.POST(
		"/login",
		authHandler.Login,
	)

	auth.POST(
		"/refresh",
		authHandler.Refresh,
	)

	auth.POST(
		"/logout",
		authHandler.Logout,
	)

	auth.POST(
		"/forgot-password",
		authHandler.ForgotPassword,
	)

	auth.POST(
		"/reset-password",
		authHandler.ResetPassword,
	)

	// ============================================================
	// PROTECTED API
	// ============================================================
	//
	// IMPORTANT:
	//
	// Authentication is applied ONLY to protected API routes.
	//
	// Dashboard HTML pages are NOT protected here.
	//
	// Dashboard JavaScript must send:
	//
	// Authorization: Bearer <access_token>
	//
	// ============================================================

	protected := api.Group(
		"/protected",
	)

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
	// USER API
	// ============================================================

	userRoutes := protected.Group(
		"/user",
	)

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

	// Future USER API routes:
	//
	// userRoutes.GET("/cases", ...)
	// userRoutes.GET("/evidence", ...)
	// userRoutes.GET("/reports", ...)
	// userRoutes.GET("/activity", ...)

	// ============================================================
	// ANALYST API
	// ============================================================

	analystRoutes := protected.Group(
		"/analyst",
	)

	analystRoutes.Use(
		middleware.RequireRoles(
			models.RoleAnalyst,
			models.RoleAdmin,
		),
	)

	// Future analyst API routes:
	//
	// analystRoutes.GET("/cases", ...)
	// analystRoutes.GET("/evidence", ...)
	// analystRoutes.GET("/reports", ...)
	// analystRoutes.GET("/activity", ...)

	_ = analystRoutes

	// ============================================================
	// ADMIN API
	// ============================================================

	adminRoutes := protected.Group(
		"/admin",
	)

	adminRoutes.Use(
		middleware.RequireRoles(
			models.RoleAdmin,
		),
	)

	// Future admin API routes:
	//
	// adminRoutes.GET("/users", ...)
	// adminRoutes.GET("/cases", ...)
	// adminRoutes.GET("/evidence", ...)
	// adminRoutes.GET("/reports", ...)
	// adminRoutes.GET("/audit-logs", ...)
	// adminRoutes.GET("/settings", ...)

	_ = adminRoutes

	// ============================================================
	// PUBLIC FRONTEND
	// ============================================================
	//
	// Public pages:
	//
	// /
	// /login
	// /register
	// /verify-email
	// /forgot-password
	// /reset-password
	//
	// ============================================================

	frontendRenderer.RegisterPublic(
		router,
	)

	// ============================================================
	// PUBLIC USER DASHBOARD SHELL
	// ============================================================
	//
	// IMPORTANT:
	//
	// /dashboard/* is intentionally NOT protected.
	//
	// These routes only render HTML.
	//
	// Actual user data is retrieved through:
	//
	// /api/v1/protected/user/*
	//
	// which IS protected by JWTAuthMiddleware + RequireRoles.
	//
	// ============================================================

	frontendRenderer.RegisterUserFrontend(
		router,
	)

	// ============================================================
	// PUBLIC ANALYST DASHBOARD SHELL
	// ============================================================
	//
	// /analyst/* is intentionally NOT protected.
	//
	// Actual analyst data must come through:
	//
	// /api/v1/protected/analyst/*
	//
	// ============================================================

	frontendRenderer.RegisterAnalystFrontend(
		router,
	)

	// ============================================================
	// PUBLIC ADMIN DASHBOARD SHELL
	// ============================================================
	//
	// /admin/* is intentionally NOT protected.
	//
	// Actual administrator data must come through:
	//
	// /api/v1/protected/admin/*
	//
	// ============================================================

	frontendRenderer.RegisterAdminFrontend(
		router,
	)

	// ============================================================
	// FRONTEND FALLBACK
	// ============================================================
	//
	// Must be registered LAST.
	//
	// API routes remain handled separately.
	//
	// ============================================================

	frontendRenderer.RegisterFallback(
		router,
	)
}
