package services

import (
	"debozero-wms/backend/internal/models"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LocationService struct {
	db *gorm.DB
}

func NewLocationService(db *gorm.DB) *LocationService {
	return &LocationService{db: db}
}

func (s *LocationService) Create(location *models.Location) error {
	// Check if code already exists
	var existing models.Location
	if err := s.db.Where("code = ?", location.Code).First(&existing).Error; err == nil {
		return errors.New("location code already exists")
	}

	return s.db.Create(location).Error
}

func (s *LocationService) GetAll(page, limit int, search string) ([]models.Location, int64, error) {
	var locations []models.Location
	var total int64

	query := s.db.Model(&models.Location{})

	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR zone ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&locations).Error; err != nil {
		return nil, 0, err
	}

	return locations, total, nil
}

func (s *LocationService) GetByID(id uuid.UUID) (*models.Location, error) {
	var location models.Location
	if err := s.db.First(&location, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &location, nil
}

func (s *LocationService) Update(id uuid.UUID, location *models.Location) error {
	var existing models.Location
	if err := s.db.First(&existing, "id = ?", id).Error; err != nil {
		return err
	}

	// Check code uniqueness if changed
	if existing.Code != location.Code {
		var codeCheck models.Location
		if err := s.db.Where("code = ? AND id != ?", location.Code, id).First(&codeCheck).Error; err == nil {
			return errors.New("location code already exists")
		}
	}

	return s.db.Model(&existing).Updates(location).Error
}

func (s *LocationService) Delete(id uuid.UUID) error {
	return s.db.Delete(&models.Location{}, "id = ?", id).Error
}
