package services

import (
	"debozero-wms/backend/internal/models"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryService struct {
	db *gorm.DB
}

func NewInventoryService(db *gorm.DB) *InventoryService {
	return &InventoryService{db: db}
}

func (s *InventoryService) GetByProductID(productID uuid.UUID) ([]models.Inventory, error) {
	var inventories []models.Inventory
	if err := s.db.Preload("Product").Preload("Location").
		Where("product_id = ?", productID).Find(&inventories).Error; err != nil {
		return nil, err
	}
	return inventories, nil
}

func (s *InventoryService) GetByLocationID(locationID uuid.UUID) ([]models.Inventory, error) {
	var inventories []models.Inventory
	if err := s.db.Preload("Product").Preload("Location").
		Where("location_id = ?", locationID).Find(&inventories).Error; err != nil {
		return nil, err
	}
	return inventories, nil
}

func (s *InventoryService) AdjustStock(productID, locationID uuid.UUID, quantity float64, userID uuid.UUID, notes string) error {
	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get or create inventory record
	var inventory models.Inventory
	err := tx.Where("product_id = ? AND location_id = ?", productID, locationID).
		FirstOrCreate(&inventory, models.Inventory{
			ProductID:  productID,
			LocationID: locationID,
			Quantity:   0,
		}).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	// Update quantity
	inventory.Quantity += quantity

	if inventory.Quantity < 0 {
		tx.Rollback()
		return errors.New("insufficient stock")
	}

	if err := tx.Save(&inventory).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Create stock movement record
	movement := models.StockMovement{
		ProductID:    productID,
		ToLocationID: locationID,
		Type:         models.MovementTypeAdjustment,
		Quantity:     quantity,
		Notes:        notes,
		CreatedBy:    userID,
	}

	if err := tx.Create(&movement).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *InventoryService) GetTotalStock(productID uuid.UUID) (float64, error) {
	var total float64
	if err := s.db.Model(&models.Inventory{}).
		Where("product_id = ?", productID).
		Select("COALESCE(SUM(quantity), 0)").Scan(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}

func (s *InventoryService) GetAll(page, limit int) ([]models.Inventory, int64, error) {
	var inventories []models.Inventory
	var total int64

	s.db.Model(&models.Inventory{}).Count(&total)

	offset := (page - 1) * limit
	if err := s.db.Preload("Product").Preload("Location").
		Offset(offset).Limit(limit).Order("updated_at DESC").
		Find(&inventories).Error; err != nil {
		return nil, 0, err
	}

	return inventories, total, nil
}
