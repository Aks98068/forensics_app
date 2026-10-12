package handlres

import (
	"errors"
	"net/http"
	"time"

	"github.com/Aks98068/forensics/internal/middlewares"
	"github.com/Aks98068/forensics/internal/models"
	"github.com/Aks98068/forensics/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ============================================================
// User Handler
// ============================================================

type UserHandler struct {
	userService *service.UserService
}

// ============================================================
// Constructor
// ============================================================

func NewUserHandler(
	userService *service.UserService,
) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// ============================================================
// Safe User Profile Response
// ============================================================

type UserProfileResponse struct {
	ID            uuid.UUID         `json:"id"`
	Email         string            `json:"email"`
	Username      string            `json:"username"`
	FirstName     string            `json:"first_name"`
	LastName      string            `json:"last_name"`
	Role          models.UserRole   `json:"role"`
	Status        models.UserStatus `json:"status"`
	EmailVerified bool              `json:"email_verified"`
	LastLoginAt   *time.Time        `json:"last_login_at"`
	CreatedAt     time.Time         `json:"created_at"`
}

// ============================================================
// GET CURRENT AUTHENTICATED USER
// GET /api/v1/protected/user/me
//
// Supports USER, ANALYST, and ADMIN.
// Uses JWT middleware and the existing UserService.
// ============================================================
func (h *UserHandler) Me(c *gin.Context) {
	// Temporary debugging: do not log the JWT itself.
	println("DEBUG: UserHandler.Me reached")

	userID, err := middlewares.GetAuthenticatedUserID(c)
	if err != nil {
		println("DEBUG: GetAuthenticatedUserID failed:", err.Error())

		c.AbortWithStatusJSON(
			http.StatusUnauthorized,
			gin.H{"error": "unauthorized"},
		)
		return
	}

	println("DEBUG: Authenticated user ID:", userID.String())

	user, err := h.userService.GetAuthenticatedUser(
		c.Request.Context(),
		userID,
	)
	if err != nil {
		println("DEBUG: GetAuthenticatedUser failed:", err.Error())

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{"error": "unauthorized"},
			)
			return
		}

		c.AbortWithStatusJSON(
			http.StatusInternalServerError,
			gin.H{"error": "failed to retrieve authenticated user"},
		)
		return
	}

	response := UserProfileResponse{
		ID:            user.ID,
		Email:         user.Email,
		Username:      user.Username,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Role:          user.Role,
		Status:        user.Status,
		EmailVerified: user.EmailVerified,
		LastLoginAt:   user.LastLoginAt,
		CreatedAt:     user.CreatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"user": response})
}
