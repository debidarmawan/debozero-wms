package handlers

import (
	"debozero-wms/backend/internal/models"
	"debozero-wms/backend/internal/services"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type PurchaseOrderHandler struct {
	poService *services.PurchaseOrderService
}

func NewPurchaseOrderHandler(poService *services.PurchaseOrderService) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{poService: poService}
}

type CreatePORequest struct {
	PONumber     string                `json:"po_number"`
	VendorName   string                `json:"vendor_name"`
	VendorEmail  string                `json:"vendor_email"`
	VendorPhone  string                `json:"vendor_phone"`
	Status       string                `json:"status"`
	ExpectedDate string                `json:"expected_date"`
	Notes        string                `json:"notes"`
	Items        []CreatePOItemRequest `json:"items"`
}

type CreatePOItemRequest struct {
	ProductID string  `json:"product_id"`
	Quantity  float64 `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
	Notes     string  `json:"notes"`
}

func (h *PurchaseOrderHandler) Create(c *fiber.Ctx) error {
	var req CreatePORequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body: " + err.Error(),
		})
	}

	// Validate required fields
	if req.PONumber == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "PO number is required",
		})
	}

	if req.VendorName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Vendor name is required",
		})
	}

	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "At least one item is required",
		})
	}

	// Get user ID from context
	userIDStr := c.Locals("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid user ID",
		})
	}

	// Build PO model
	po := models.PurchaseOrder{
		PONumber:    req.PONumber,
		VendorName:  req.VendorName,
		VendorEmail: req.VendorEmail,
		VendorPhone: req.VendorPhone,
		Notes:       req.Notes,
		CreatedBy:   userID,
	}

	// Parse status
	if req.Status != "" {
		po.Status = models.POStatus(req.Status)
	} else {
		po.Status = models.POStatusDraft
	}

	// Parse expected date
	if req.ExpectedDate != "" {
		if expectedDate, err := time.Parse("2006-01-02", req.ExpectedDate); err == nil {
			po.ExpectedDate = &expectedDate
		}
	}

	// Create PO first
	if err := h.poService.Create(&po); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Create items if provided
	for _, itemReq := range req.Items {
		productID, err := uuid.Parse(itemReq.ProductID)
		if err != nil {
			continue // Skip invalid product IDs
		}

		item := models.PurchaseOrderItem{
			ProductID: productID,
			Quantity:  itemReq.Quantity,
			UnitPrice: itemReq.UnitPrice,
			Notes:     itemReq.Notes,
		}

		if err := h.poService.AddItem(po.ID, &item); err != nil {
			// Continue with other items even if one fails
			continue
		}
	}

	// Reload with relations
	createdPO, _ := h.poService.GetByID(po.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error": false,
		"data":  createdPO,
	})
}

func (h *PurchaseOrderHandler) GetAll(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	status := c.Query("status", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	pos, total, err := h.poService.GetAll(page, limit, search, status)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  pos,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *PurchaseOrderHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid PO ID",
		})
	}

	po, err := h.poService.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Purchase order not found",
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  po,
	})
}

func (h *PurchaseOrderHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid PO ID",
		})
	}

	var po models.PurchaseOrder
	if err := c.BodyParser(&po); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := h.poService.Update(id, &po); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	updatedPO, _ := h.poService.GetByID(id)
	return c.JSON(fiber.Map{
		"error": false,
		"data":  updatedPO,
	})
}

func (h *PurchaseOrderHandler) AddItem(c *fiber.Ctx) error {
	poID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid PO ID",
		})
	}

	var item models.PurchaseOrderItem
	if err := c.BodyParser(&item); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := h.poService.AddItem(poID, &item); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error": false,
		"data":  item,
	})
}

func (h *PurchaseOrderHandler) UpdateItem(c *fiber.Ctx) error {
	itemID, err := uuid.Parse(c.Params("itemId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid item ID",
		})
	}

	var item models.PurchaseOrderItem
	if err := c.BodyParser(&item); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := h.poService.UpdateItem(itemID, &item); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  item,
	})
}

func (h *PurchaseOrderHandler) DeleteItem(c *fiber.Ctx) error {
	itemID, err := uuid.Parse(c.Params("itemId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid item ID",
		})
	}

	if err := h.poService.DeleteItem(itemID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Item deleted successfully",
	})
}

func (h *PurchaseOrderHandler) Receive(c *fiber.Ctx) error {
	poID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid PO ID",
		})
	}

	var req struct {
		LocationID uuid.UUID                     `json:"location_id"`
		Items      []services.ReceiveItemRequest `json:"items"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	userIDStr := c.Locals("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid user ID",
		})
	}

	if err := h.poService.ReceiveItems(poID, req.Items, req.LocationID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	updatedPO, _ := h.poService.GetByID(poID)
	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Items received successfully",
		"data":    updatedPO,
	})
}

func (h *PurchaseOrderHandler) Cancel(c *fiber.Ctx) error {
	poID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid PO ID",
		})
	}

	if err := h.poService.Cancel(poID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "PO cancelled successfully",
	})
}
