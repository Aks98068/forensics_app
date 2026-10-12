package handlres

// import (
// 	"errors"
// 	"net/http"
// 	"time"

// 	"github.com/Aks98068/forensics/internal/models"
// 	"github.com/gin-gonic/gin"
// 	"github.com/google/uuid"
// 	"gorm.io/gorm"
// )

// type UserProfileResponse struct {
// 	ID            uuid.UUID         `json:"id"`
// 	Email         string            `json:"email"`
// 	Username      string            `json:"username"`
// 	FirstName     string            `json:"first_name"`
// 	LastName      string            `json:"last_name"`
// 	Role          models.UserRole   `json:"role"`
// 	Status        models.UserStatus `json:"status"`
// 	EmailVerified bool              `json:"email_verified"`
// 	LastLoginAt   *time.Time        `json:"last_login_at"`
// 	CreatedAt     time.Time         `json:"created_at"`
// }

// // GetUser retrieves a user by UUID.
// func GetUser(db *gorm.DB, userID uuid.UUID) (*models.User, error) {
// 	var user models.User

// 	err := db.Where("id = ?", userID).First(&user).Error
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &user, nil
// }

// // GetProfile returns the authenticated user's profile.
// func GetProfile(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		userIDValue, exists := c.Get("userID")
// 		if !exists {
// 			c.JSON(http.StatusUnauthorized, gin.H{
// 				"error": "Unauthorized",
// 			})
// 			return
// 		}

// 		// Support UUID values stored directly in Gin context.
// 		userID, ok := userIDValue.(uuid.UUID)
// 		if !ok {
// 			// Also support UUIDs stored as strings.
// 			userIDString, stringOK := userIDValue.(string)
// 			if !stringOK {
// 				c.JSON(http.StatusUnauthorized, gin.H{
// 					"error": "Invalid authenticated user ID",
// 				})
// 				return
// 			}

// 			var err error
// 			userID, err = uuid.Parse(userIDString)
// 			if err != nil {
// 				c.JSON(http.StatusUnauthorized, gin.H{
// 					"error": "Invalid authenticated user ID",
// 				})
// 				return
// 			}
// 		}

// 		user, err := GetUser(db, userID)
// 		if err != nil {
// 			if errors.Is(err, gorm.ErrRecordNotFound) {
// 				c.JSON(http.StatusNotFound, gin.H{
// 					"error": "User not found",
// 				})
// 				return
// 			}

// 			c.JSON(http.StatusInternalServerError, gin.H{
// 				"error": "Failed to retrieve profile",
// 			})
// 			return
// 		}

// 		c.JSON(http.StatusOK, UserProfileResponse{
// 			ID:            user.ID,
// 			Email:         user.Email,
// 			Username:      user.Username,
// 			FirstName:     user.FirstName,
// 			LastName:      user.LastName,
// 			Role:          user.Role,
// 			Status:        user.Status,
// 			EmailVerified: user.EmailVerified,
// 			LastLoginAt:   user.LastLoginAt,
// 			CreatedAt:     user.CreatedAt,
// 		})
// 	}
// }
