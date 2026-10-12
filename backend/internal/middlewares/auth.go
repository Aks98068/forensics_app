package middlewares

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/Aks98068/forensics/internal/models"
	"github.com/Aks98068/forensics/internal/security"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	ContextUserID    = "userID"
	ContextUsername  = "username"
	ContextRole      = "role"
	ContextTokenType = "tokenType"
	ContextClaims    = "claims"
)

type JWTAuthConfig struct {
	AccessSecret string
	Issuer       string
	Audience     string
}

func JWTAuthMiddleware(config JWTAuthConfig) gin.HandlerFunc {
	config.AccessSecret = strings.TrimSpace(config.AccessSecret)
	config.Issuer = strings.TrimSpace(config.Issuer)
	config.Audience = strings.TrimSpace(config.Audience)

	if config.AccessSecret == "" {
		panic("JWT access secret cannot be empty")
	}
	if config.Issuer == "" {
		panic("JWT issuer cannot be empty")
	}
	if config.Audience == "" {
		panic("JWT audience cannot be empty")
	}

	secret := []byte(config.AccessSecret)

	// Safe startup diagnostic: values only, never the signing secret.
	log.Printf(
		"JWT middleware configured: issuer=%q audience=%q",
		config.Issuer,
		config.Audience,
	)

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			rejectJWT(c, "missing Authorization header")
			return
		}

		parts := strings.Fields(authHeader)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			rejectJWT(c, "invalid Bearer authorization format")
			return
		}

		rawToken := parts[1]
		if rawToken == "" {
			rejectJWT(c, "empty access token")
			return
		}

		const maximumAccessTokenLength = 8192
		if len(rawToken) > maximumAccessTokenLength {
			rejectJWT(c, "access token exceeds maximum length")
			return
		}

		claims := &security.AccessTokenClaims{}

		token, err := jwt.ParseWithClaims(
			rawToken,
			claims,
			func(token *jwt.Token) (interface{}, error) {
				if token.Method != jwt.SigningMethodHS256 {
					return nil, errors.New("unexpected JWT signing method")
				}
				return secret, nil
			},
			jwt.WithValidMethods([]string{
				jwt.SigningMethodHS256.Alg(),
			}),
			jwt.WithIssuer(config.Issuer),
			jwt.WithAudience(config.Audience),
			jwt.WithIssuedAt(),
		)

		if err != nil {
			// The library error identifies the failing claim.
			// Never log the raw token or signing secret.
			rejectJWT(c, "token parsing or validation failed: "+err.Error())
			return
		}

		if token == nil || !token.Valid {
			rejectJWT(c, "token is invalid")
			return
		}

		if claims.ExpiresAt == nil {
			rejectJWT(c, "missing expiration claim")
			return
		}

		if claims.IssuedAt == nil {
			rejectJWT(c, "missing issued-at claim")
			return
		}

		if strings.TrimSpace(claims.ID) == "" {
			rejectJWT(c, "missing JWT ID")
			return
		}

		if _, err := uuid.Parse(claims.ID); err != nil {
			rejectJWT(c, "JWT ID is not a valid UUID")
			return
		}

		if strings.TrimSpace(claims.Subject) == "" {
			rejectJWT(c, "missing subject claim")
			return
		}

		subjectUserID, err := uuid.Parse(claims.Subject)
		if err != nil {
			rejectJWT(c, "subject is not a valid UUID")
			return
		}

		if claims.UserID == uuid.Nil {
			rejectJWT(c, "missing or invalid user ID")
			return
		}

		if subjectUserID != claims.UserID {
			rejectJWT(c, "subject and user ID do not match")
			return
		}

		if claims.TokenType != "access" {
			rejectJWT(c, "token type is not access")
			return
		}

		username := strings.TrimSpace(claims.Username)
		if username == "" {
			rejectJWT(c, "missing username claim")
			return
		}

		if !isValidRole(claims.Role) {
			rejectJWT(c, "invalid role claim")
			return
		}

		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextUsername, username)
		c.Set(ContextRole, claims.Role)
		c.Set(ContextTokenType, claims.TokenType)
		c.Set(ContextClaims, claims)

		c.Next()
	}
}

func isValidRole(role models.UserRole) bool {
	switch role {
	case models.RoleUser, models.RoleAnalyst, models.RoleAdmin:
		return true
	default:
		return false
	}
}

func rejectJWT(c *gin.Context, reason string) {
	log.Printf(
		"JWT authentication rejected: method=%s path=%s reason=%s",
		c.Request.Method,
		c.Request.URL.Path,
		reason,
	)

	c.AbortWithStatusJSON(
		http.StatusUnauthorized,
		gin.H{"error": "unauthorized"},
	)
}
