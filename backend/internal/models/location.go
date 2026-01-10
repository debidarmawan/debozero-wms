package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Location struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Code      string         `gorm:"uniqueIndex;not null" json:"code"` // e.g., A-01-01 (Zone-Aisle-Shelf)
	Name      string         `gorm:"not null" json:"name"`
	Zone      string         `json:"zone"`     // A, B, C, etc.
	Aisle     string         `json:"aisle"`    // 01, 02, etc.
	Shelf     string         `json:"shelf"`    // 01, 02, etc.
	Capacity  float64        `json:"capacity"` // max weight or volume
	IsActive  bool           `gorm:"default:true" json:"is_active"`
}

func (l *Location) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}
