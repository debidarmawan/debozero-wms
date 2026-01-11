package services

import (
	"debozero-wms/backend/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StockMovementService struct {
	db *gorm.DB
}

func NewStockMovementService(db *gorm.DB) *StockMovementService {
	return &StockMovementService{db: db}
}

func (s *StockMovementService) GetAll(page, limit int, filters StockMovementFilters) ([]models.StockMovement, int64, error) {
	var movements []models.StockMovement
	var total int64

	query := s.db.Model(&models.StockMovement{})

	// Apply filters
	if filters.ProductID != nil {
		query = query.Where("product_id = ?", *filters.ProductID)
	}
	if filters.LocationID != nil {
		query = query.Where("to_location_id = ? OR from_location_id = ?", *filters.LocationID, *filters.LocationID)
	}
	if filters.Type != "" {
		query = query.Where("type = ?", filters.Type)
	}
	if filters.StartDate != nil {
		query = query.Where("created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("created_at <= ?", *filters.EndDate)
	}
	if filters.Reference != "" {
		query = query.Where("reference ILIKE ?", "%"+filters.Reference+"%")
	}

	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Preload("Product").
		Preload("FromLocation").
		Preload("ToLocation").
		Preload("User").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&movements).Error; err != nil {
		return nil, 0, err
	}

	return movements, total, nil
}

func (s *StockMovementService) GetByID(id uuid.UUID) (*models.StockMovement, error) {
	var movement models.StockMovement
	if err := s.db.Preload("Product").
		Preload("FromLocation").
		Preload("ToLocation").
		Preload("User").
		First(&movement, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &movement, nil
}

func (s *StockMovementService) GetByProductID(productID uuid.UUID, page, limit int) ([]models.StockMovement, int64, error) {
	var movements []models.StockMovement
	var total int64

	query := s.db.Model(&models.StockMovement{}).Where("product_id = ?", productID)
	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Preload("Product").
		Preload("FromLocation").
		Preload("ToLocation").
		Preload("User").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&movements).Error; err != nil {
		return nil, 0, err
	}

	return movements, total, nil
}

type StockMovementFilters struct {
	ProductID  *uuid.UUID
	LocationID *uuid.UUID
	Type       string
	StartDate  *time.Time
	EndDate    *time.Time
	Reference  string
}
