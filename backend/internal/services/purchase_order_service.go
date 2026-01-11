package services

import (
	"debozero-wms/backend/internal/models"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseOrderService struct {
	db *gorm.DB
}

func NewPurchaseOrderService(db *gorm.DB) *PurchaseOrderService {
	return &PurchaseOrderService{db: db}
}

func (s *PurchaseOrderService) Create(po *models.PurchaseOrder) error {
	// Check if PO number already exists
	var existing models.PurchaseOrder
	if err := s.db.Where("po_number = ?", po.PONumber).First(&existing).Error; err == nil {
		return errors.New("PO number already exists")
	}

	// Set default status
	if po.Status == "" {
		po.Status = models.POStatusDraft
	}

	return s.db.Create(po).Error
}

func (s *PurchaseOrderService) GetAll(page, limit int, search string, status string) ([]models.PurchaseOrder, int64, error) {
	var pos []models.PurchaseOrder
	var total int64

	query := s.db.Model(&models.PurchaseOrder{})

	if search != "" {
		query = query.Where("po_number ILIKE ? OR vendor_name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Preload("Items").Preload("Items.Product").Preload("User").
		Offset(offset).Limit(limit).Order("created_at DESC").
		Find(&pos).Error; err != nil {
		return nil, 0, err
	}

	return pos, total, nil
}

func (s *PurchaseOrderService) GetByID(id uuid.UUID) (*models.PurchaseOrder, error) {
	var po models.PurchaseOrder
	if err := s.db.Preload("Items").Preload("Items.Product").Preload("User").
		First(&po, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &po, nil
}

func (s *PurchaseOrderService) Update(id uuid.UUID, po *models.PurchaseOrder) error {
	var existing models.PurchaseOrder
	if err := s.db.First(&existing, "id = ?", id).Error; err != nil {
		return err
	}

	// Check PO number uniqueness if changed
	if existing.PONumber != po.PONumber {
		var poCheck models.PurchaseOrder
		if err := s.db.Where("po_number = ? AND id != ?", po.PONumber, id).First(&poCheck).Error; err == nil {
			return errors.New("PO number already exists")
		}
	}

	// Don't allow status changes through update (use specific methods)
	po.Status = existing.Status

	return s.db.Model(&existing).Updates(po).Error
}

func (s *PurchaseOrderService) AddItem(poID uuid.UUID, item *models.PurchaseOrderItem) error {
	item.PurchaseOrderID = poID
	return s.db.Create(item).Error
}

func (s *PurchaseOrderService) UpdateItem(itemID uuid.UUID, item *models.PurchaseOrderItem) error {
	return s.db.Model(&models.PurchaseOrderItem{}).Where("id = ?", itemID).Updates(item).Error
}

func (s *PurchaseOrderService) DeleteItem(itemID uuid.UUID) error {
	return s.db.Delete(&models.PurchaseOrderItem{}, "id = ?", itemID).Error
}

func (s *PurchaseOrderService) ReceiveItems(poID uuid.UUID, items []ReceiveItemRequest, locationID uuid.UUID, userID uuid.UUID) error {
	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get PO
	var po models.PurchaseOrder
	if err := tx.Preload("Items").First(&po, "id = ?", poID).Error; err != nil {
		tx.Rollback()
		return err
	}

	if po.Status == models.POStatusReceived {
		tx.Rollback()
		return errors.New("PO is already fully received")
	}

	if po.Status == models.POStatusCancelled {
		tx.Rollback()
		return errors.New("PO is cancelled")
	}

	// Process each received item
	for _, receiveItem := range items {
		// Find PO item
		var poItem models.PurchaseOrderItem
		if err := tx.First(&poItem, "id = ? AND purchase_order_id = ?", receiveItem.ItemID, poID).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("PO item not found: %v", receiveItem.ItemID)
		}

		// Check if quantity is valid
		if receiveItem.Quantity <= 0 {
			tx.Rollback()
			return fmt.Errorf("invalid quantity for item %s", poItem.ID)
		}

		remainingQty := poItem.Quantity - poItem.ReceivedQty
		if receiveItem.Quantity > remainingQty {
			tx.Rollback()
			return fmt.Errorf("received quantity exceeds remaining quantity for item")
		}

		// Update received quantity
		poItem.ReceivedQty += receiveItem.Quantity
		if err := tx.Save(&poItem).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Update inventory
		var inventory models.Inventory
		err := tx.Where("product_id = ? AND location_id = ?", poItem.ProductID, locationID).
			FirstOrCreate(&inventory, models.Inventory{
				ProductID:  poItem.ProductID,
				LocationID: locationID,
				Quantity:   0,
			}).Error

		if err != nil {
			tx.Rollback()
			return err
		}

		inventory.Quantity += receiveItem.Quantity
		if err := tx.Save(&inventory).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Create stock movement
		movement := models.StockMovement{
			ProductID:    poItem.ProductID,
			ToLocationID: locationID,
			Type:         models.MovementTypeInbound,
			Quantity:     receiveItem.Quantity,
			Reference:    po.PONumber,
			Notes:        receiveItem.Notes,
			CreatedBy:    userID,
		}

		if err := tx.Create(&movement).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	// Reload PO items to get updated received quantities
	if err := tx.Preload("Items").First(&po, "id = ?", poID).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Update PO status based on actual received quantities
	allReceived := true
	for _, item := range po.Items {
		if item.ReceivedQty < item.Quantity {
			allReceived = false
			break
		}
	}

	if allReceived {
		now := time.Now()
		po.Status = models.POStatusReceived
		po.ReceivedDate = &now
	} else {
		po.Status = models.POStatusPartial
	}

	if err := tx.Save(&po).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *PurchaseOrderService) Cancel(poID uuid.UUID) error {
	var po models.PurchaseOrder
	if err := s.db.First(&po, "id = ?", poID).Error; err != nil {
		return err
	}

	if po.Status == models.POStatusReceived {
		return errors.New("cannot cancel a received PO")
	}

	po.Status = models.POStatusCancelled
	return s.db.Save(&po).Error
}

type ReceiveItemRequest struct {
	ItemID   uuid.UUID `json:"item_id"`
	Quantity float64   `json:"quantity"`
	Notes    string    `json:"notes"`
}
