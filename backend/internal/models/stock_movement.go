package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MovementType string

const (
	MovementTypeInbound    MovementType = "inbound"    // Receiving
	MovementTypeOutbound   MovementType = "outbound"   // Shipping
	MovementTypeTransfer   MovementType = "transfer"   // Internal transfer
	MovementTypeAdjustment MovementType = "adjustment" // Stock adjustment
)

type StockMovement struct {
	ID             uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt      time.Time    `json:"created_at"`
	CreatedBy      uuid.UUID    `gorm:"type:uuid;not null" json:"created_by"`
	ProductID      uuid.UUID    `gorm:"type:uuid;not null;index" json:"product_id"`
	FromLocationID *uuid.UUID   `gorm:"type:uuid;index" json:"from_location_id,omitempty"`
	ToLocationID   uuid.UUID    `gorm:"type:uuid;not null;index" json:"to_location_id"`
	Type           MovementType `gorm:"type:varchar(20);not null" json:"type"`
	Quantity       float64      `gorm:"not null" json:"quantity"`
	Reference      string       `json:"reference"` // PO number, SO number, etc.
	Notes          string       `json:"notes"`

	// Relations
	Product      Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	FromLocation *Location `gorm:"foreignKey:FromLocationID" json:"from_location,omitempty"`
	ToLocation   Location  `gorm:"foreignKey:ToLocationID" json:"to_location,omitempty"`
	User         User      `gorm:"foreignKey:CreatedBy" json:"user,omitempty"`
}

func (s *StockMovement) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
