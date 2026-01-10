package services

import (
	"debozero-wms/backend/internal/models"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductService struct {
	db *gorm.DB
}

func NewProductService(db *gorm.DB) *ProductService {
	return &ProductService{db: db}
}

func (s *ProductService) Create(product *models.Product) error {
	// Check if SKU already exists
	var existing models.Product
	if err := s.db.Where("sku = ?", product.SKU).First(&existing).Error; err == nil {
		return errors.New("SKU already exists")
	}

	return s.db.Create(product).Error
}

func (s *ProductService) GetAll(page, limit int, search string) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := s.db.Model(&models.Product{})

	if search != "" {
		query = query.Where("name ILIKE ? OR sku ILIKE ? OR barcode ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (s *ProductService) GetByID(id uuid.UUID) (*models.Product, error) {
	var product models.Product
	if err := s.db.First(&product, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Update(id uuid.UUID, product *models.Product) error {
	var existing models.Product
	if err := s.db.First(&existing, "id = ?", id).Error; err != nil {
		return err
	}

	// Check SKU uniqueness if changed
	if existing.SKU != product.SKU {
		var skuCheck models.Product
		if err := s.db.Where("sku = ? AND id != ?", product.SKU, id).First(&skuCheck).Error; err == nil {
			return errors.New("SKU already exists")
		}
	}

	return s.db.Model(&existing).Updates(product).Error
}

func (s *ProductService) Delete(id uuid.UUID) error {
	return s.db.Delete(&models.Product{}, "id = ?", id).Error
}
