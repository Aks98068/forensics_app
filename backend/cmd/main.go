package main

import (
	"log"
	"os"
	"time"

	"github.com/Aks98068/forensics/internal/configs"
	"github.com/Aks98068/forensics/internal/database"
	"github.com/Aks98068/forensics/internal/handlres"
	middleware "github.com/Aks98068/forensics/internal/middlewares"
	"github.com/Aks98068/forensics/internal/repository"
	"github.com/Aks98068/forensics/internal/routes"
	"github.com/Aks98068/forensics/internal/security"
	"github.com/Aks98068/forensics/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	const appName = "Forencis"

	cfg, err := configs.Load()
	if err != nil {
		log.Fatalf("configuration error: %v", err)
	}

	nextURL := os.Getenv("NEXT_URL")
	if nextURL == "" {
		nextURL = "http://127.0.0.1:3001"
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection error: %v", err)
	}

	log.Println("MySQL database connected successfully")

	if err := database.MigrateDB(db); err != nil {
		log.Fatalf("database migration error: %v", err)
	}

	log.Println("database migration completed successfully")

	userRepository := repository.NewUserRepository(db)

	emailVerificationRepository :=
		repository.NewEmailVerificationRepository(db)

	refreshTokenRepository :=
		repository.NewRefreshTokenRepository(db)

	passwordResetRepository :=
		repository.NewPasswordResetRepository(db)

	passwordHasher := security.Newpassword()

	tokenService := security.NewTokenService(
		cfg.JWTAccessSecret,
		time.Duration(cfg.JWTAccessTTLMinutes)*time.Minute,
		time.Duration(cfg.JWTRefreshTTLDays)*24*time.Hour,
	)

	emailService := service.NewEmailService(
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUsername,
		cfg.SMTPPassword,
		cfg.SMTPFrom,
	)

	emailVerificationService :=
		service.NewEmailVerificationService(
			emailVerificationRepository,
			userRepository,
			emailService,
			cfg.EmailURL,
		)

	passwordResetService :=
		service.NewPasswordResetService(
			passwordResetRepository,
			userRepository,
			passwordHasher,
			emailService,
			cfg.AppURL,
			time.Duration(cfg.PasswordResetTTLMinutes)*time.Minute,
		)

	authTokenService := service.NewAuthTokenService(
		tokenService,
		refreshTokenRepository,
	)

	authService := service.NewAuthService(
		userRepository,
		passwordHasher,
		emailVerificationService,
		emailService,
		authTokenService,
		cfg.EmailURL,
		passwordResetService,
	)

	userService := service.NewUserService(
		userRepository,
	)

	authHandler := handlres.NewAuthHandler(
		authService,
	)

	userHandler := handlres.NewUserHandler(
		userService,
	)

	router := gin.New()

	router.Use(
		gin.Logger(),
		gin.Recovery(),
	)

	router.Use(
		middleware.RequestID(),
	)

	router.Use(
		middleware.SecurityHeaders(),
	)

	router.Use(
		middleware.CORS(
			middleware.CORSConfig{
				AllowedOrigins:   cfg.CORSAllowedOrigins,
				AllowCredentials: cfg.CORSAllowCredentials,
			},
		),
	)

	router.Use(
		middleware.RequestBodyLimit(
			1024 * 1024,
		),
	)

	if err := router.SetTrustedProxies(nil); err != nil {
		log.Fatalf(
			"trusted proxy configuration error: %v",
			err,
		)
	}

	if err := routes.Routes(
		router,
		authHandler,
		userHandler,
		&routes.Config{
			JWTAccessSecret: cfg.JWTAccessSecret,
			JWTIssuer:       "forencis-api",
			JWTAudience:     "forencis-client",
			NextURL:         nextURL,
		},
	); err != nil {
		log.Fatalf(
			"route configuration error: %v",
			err,
		)
	}

	log.Printf(
		"Next.js frontend proxy enabled: %s",
		nextURL,
	)

	address := ":" + cfg.AppPort

	log.Printf(
		"%s backend running on http://localhost%s",
		appName,
		address,
	)

	log.Printf(
		"API base URL: http://localhost%s/api/v1",
		address,
	)

	if err := router.Run(address); err != nil {
		log.Fatalf(
			"%s server error: %v",
			appName,
			err,
		)
	}
}