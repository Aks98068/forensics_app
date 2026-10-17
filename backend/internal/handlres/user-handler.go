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

type Dbs struct {
	db *gorm.DB
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

type AdminUserResponse struct {
	ID            uuid.UUID         `json:"id"`
	Email         string            `json:"email"`
	Username      string            `json:"username"`
	FirstName     string            `json:"first_name"`
	LastName      string            `json:"last_name"`
	Role          models.UserRole   `json:"role"`
	Status        models.UserStatus `json:"status"`
	EmailVerified bool              `json:"email_verified"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
	LastLoginAt   *time.Time        `json:"last_login_at"`
}

type AdminUpdateUserRequest struct {
	Email         *string            `json:"email"`
	Username      *string            `json:"username"`
	FirstName     *string            `json:"first_name"`
	LastName      *string            `json:"last_name"`
	Role          *models.UserRole   `json:"role"`
	Status        *models.UserStatus `json:"status"`
	EmailVerified *bool              `json:"email_verified"`
}
type AdminReplaceUserRequest struct {
	Email         string            `json:"email" binding:"required,email"`
	Username      string            `json:"username" binding:"required"`
	FirstName     string            `json:"first_name" binding:"required"`
	LastName      string            `json:"last_name" binding:"required"`
	Role          models.UserRole   `json:"role" binding:"required"`
	Status        models.UserStatus `json:"status" binding:"required"`
	EmailVerified bool              `json:"email_verified"`
}
type AdminCreateUserRequest struct {
	Email     string          `json:"email" binding:"required,email"`
	Username  string          `json:"username" binding:"required"`
	FirstName string          `json:"first_name" binding:"required"`
	LastName  string          `json:"last_name" binding:"required"`
	Password  string          `json:"password" binding:"required,min=12"`
	Role      models.UserRole `json:"role" binding:"required"`
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

func (d *Dbs) AdminManageUsers(c *gin.Context) {
	switch c.Request.Method {
	case http.MethodGet:
		idParam := c.Param("id")

		// GET /users/:id — retrieve one user
		if idParam != "" {
			id, err := uuid.Parse(idParam)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid user ID",
				})
				return
			}

			var user models.User

			result := d.db.WithContext(c.Request.Context()).
				First(&user, "id = ?", id)

			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "User not found",
				})
				return
			}

			if result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to retrieve user",
				})
				return
			}

			response := AdminUserResponse{
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
				UpdatedAt:     user.UpdatedAt,
			}

			c.JSON(http.StatusOK, gin.H{
				"user": response,
			})
			return
		}
		// GET /users
		var users []models.User

		result := d.db.WithContext(c.Request.Context()).Order("created_at DESC").Find(&users)

		if result.Error != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to retrive users",
			})
			return
		}

		response := make([]AdminUserResponse, 0, len(users))
		for _, user := range users {
			response = append(response, AdminUserResponse{
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
				UpdatedAt:     user.UpdatedAt,
			})
		}

		c.JSON(http.StatusOK, gin.H{"users": response,
			"count": len(response)})

	case http.MethodPost:
		// POST /users

	case http.MethodPatch:
		// PATCH /users/:id
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error ": "Invlaid user ID",
			})
			return
		}
		var request AdminUpdateUserRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request body",
			})
			return

		}
		updates := map[string]interface{}{}
		if request.Email != nil {
			updates["email"] = *request.Email
		}
		if request.Username != nil {
			updates["username"] = *request.Username
		}
		if request.FirstName != nil {
			updates["first_name"] = *request.FirstName
		}
		if request.LastName != nil {
			updates["last_name"] = *request.LastName
		}
		if request.Role != nil {
			updates["role"] = *request.Role
		}
		if request.Status != nil {
			updates["status"] = *request.Status
		}
		if request.EmailVerified != nil {
			updates["email_verified"] = *request.EmailVerified
		}

		if len(updates) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No fileds provided for updaets ",
			})
			return
		}

		result := d.db.WithContext(c.Request.Context()).Model(&models.User{}).Where("id = ?", id).Updates(updates)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update user",
			})
			return
		}
		if result.RowsAffected == 0 {
			var user models.User
			check := d.db.WithContext(c.Request.Context()).Select("id").First(&user, "id=?", id)

			if errors.Is(check.Error, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "User not found",
				})
				return
			}
			if check.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to retrive user",
				})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "User updated successfully",
		})

	case http.MethodPut:
		// Parse the user ID from the URL.
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user ID",
			})
			return
		}

		// Decode and validate the request body.
		var request AdminReplaceUserRequest

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid or incomplete request body",
			})
			return
		}

		// Validate the allowed role and status values.
		if request.Role != models.UserRole("USER") &&
			request.Role != models.UserRole("ADMIN") &&
			request.Role != models.UserRole("STAFF") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user role",
			})
			return
		}

		if request.Status != models.UserStatus("ACTIVE") &&
			request.Status != models.UserStatus("SUSPENDED") &&
			request.Status != models.UserStatus("DISABLED") &&
			request.Status != models.UserStatus("PENDING") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user status",
			})
			return
		}

		// Update all editable fields.
		updates := map[string]interface{}{
			"email":          request.Email,
			"username":       request.Username,
			"first_name":     request.FirstName,
			"last_name":      request.LastName,
			"role":           request.Role,
			"status":         request.Status,
			"email_verified": request.EmailVerified,
		}

		result := d.db.WithContext(c.Request.Context()).
			Model(&models.User{}).
			Where("id = ?", id).
			Updates(updates)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to replace user details",
			})
			return
		}

		// Check whether the user exists, including when values
		// were unchanged and the database reports zero affected rows.
		if result.RowsAffected == 0 {
			var user models.User

			check := d.db.WithContext(c.Request.Context()).
				Select("id").
				First(&user, "id = ?", id)

			if errors.Is(check.Error, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "User not found",
				})
				return
			}

			if check.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to retrieve user",
				})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "User details replaced successfully",
		})

	case http.MethodDelete:
		// DELETE /users/:id
		id, err := uuid.Parse(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user ID",
			})
			return
		}
		result := d.db.WithContext(c.Request.Context()).Where("id=?", id).Delete(&models.User{})
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to delete user",
			})
			return
		}
		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "User not found ",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "User Deleted Succesfully",
		})

	default:
		c.AbortWithStatusJSON(
			http.StatusMethodNotAllowed,
			gin.H{"error": "method not allowed"},
		)
	}
}
