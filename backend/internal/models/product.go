package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	SKU         string         `gorm:"uniqueIndex;not null" json:"sku"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	Category    string         `json:"category"`
	Unit        string         `gorm:"default:pcs" json:"unit"` // pcs, kg, box, etc.
	Weight      float64        `json:"weight"`                  // in kg
	Length      float64        `json:"length"`                  // in cm
	Width       float64        `json:"width"`                   // in cm
	Height      float64        `json:"height"`                  // in cm
	Barcode     string         `json:"barcode"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
