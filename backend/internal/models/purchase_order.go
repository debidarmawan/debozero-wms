package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type POStatus string

const (
	POStatusDraft     POStatus = "draft"
	POStatusPending   POStatus = "pending"
	POStatusPartial   POStatus = "partial"
	POStatusReceived  POStatus = "received"
	POStatusCancelled POStatus = "cancelled"
)

type PurchaseOrder struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	PONumber     string         `gorm:"uniqueIndex;not null" json:"po_number"`
	VendorName   string         `gorm:"not null" json:"vendor_name"`
	VendorEmail  string         `json:"vendor_email"`
	VendorPhone  string         `json:"vendor_phone"`
	Status       POStatus       `gorm:"type:varchar(20);default:draft" json:"status"`
	ExpectedDate *time.Time     `json:"expected_date"`
	ReceivedDate *time.Time     `json:"received_date"`
	Notes        string         `json:"notes"`
	CreatedBy    uuid.UUID      `gorm:"type:uuid;not null" json:"created_by"`

	// Relations
	Items []PurchaseOrderItem `gorm:"foreignKey:PurchaseOrderID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
	User  User                `gorm:"foreignKey:CreatedBy" json:"user,omitempty"`
}

func (po *PurchaseOrder) BeforeCreate(tx *gorm.DB) error {
	if po.ID == uuid.Nil {
		po.ID = uuid.New()
	}
	return nil
}

type PurchaseOrderItem struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	PurchaseOrderID uuid.UUID `gorm:"type:uuid;not null;index" json:"purchase_order_id"`
	ProductID       uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	Quantity        float64   `gorm:"not null" json:"quantity"`
	ReceivedQty     float64   `gorm:"default:0" json:"received_qty"`
	UnitPrice       float64   `json:"unit_price"`
	Notes           string    `json:"notes"`

	// Relations
	PurchaseOrder PurchaseOrder `gorm:"foreignKey:PurchaseOrderID" json:"purchase_order,omitempty"`
	Product       Product       `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (poi *PurchaseOrderItem) BeforeCreate(tx *gorm.DB) error {
	if poi.ID == uuid.Nil {
		poi.ID = uuid.New()
	}
	return nil
}
