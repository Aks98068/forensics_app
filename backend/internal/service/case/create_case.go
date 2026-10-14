package caseService

import (
	"github.com/Aks98068/forensics/internal/models"
	"gorm.io/gorm"
)

func GetInvestigators(db *gorm.DB) ([]models.User, error) {
	var users []models.User

	err := db.
		Model(&models.User{}).
		Select("id", "username", "first_name", "last_name", "email").
		Where("role = ? AND status = ?",
			models.RoleUser,
			models.StatusActive,
		).
		Order("first_name ASC, last_name ASC").
		Find(&users).Error

	return users, err
}


