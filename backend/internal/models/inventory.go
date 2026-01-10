package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Inventory struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	ProductID  uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	LocationID uuid.UUID `gorm:"type:uuid;not null;index" json:"location_id"`
	Quantity   float64   `gorm:"not null;default:0" json:"quantity"`
	Reserved   float64   `gorm:"default:0" json:"reserved"` // reserved for orders
	Available  float64   `gorm:"-" json:"available"`        // calculated: quantity - reserved

	// Relations
	Product  Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Location Location `gorm:"foreignKey:LocationID" json:"location,omitempty"`
}

func (i *Inventory) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

func (i *Inventory) AfterFind(tx *gorm.DB) error {
	i.Available = i.Quantity - i.Reserved
	return nil
}
