package handlres

import (
	"net/http"

	caseService "github.com/Aks98068/forensics/internal/service/case"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type InvestigatorHandler struct {
	DB *gorm.DB
}

func NewInvestigatorHandler(db *gorm.DB) *InvestigatorHandler {
	return &InvestigatorHandler{DB: db}
}

func (h *InvestigatorHandler) GetAvailableInvestigators(c *gin.Context) {
	investigators, err := caseService.GetInvestigators(h.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve available investigators",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"investigators": investigators,
	})
}
