package handlers

import (
	"debozero-wms/backend/internal/services"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type StockMovementHandler struct {
	stockMovementService *services.StockMovementService
}

func NewStockMovementHandler(stockMovementService *services.StockMovementService) *StockMovementHandler {
	return &StockMovementHandler{stockMovementService: stockMovementService}
}

func (h *StockMovementHandler) GetAll(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	// Parse filters
	filters := services.StockMovementFilters{}

	if productIDStr := c.Query("product_id"); productIDStr != "" {
		if productID, err := uuid.Parse(productIDStr); err == nil {
			filters.ProductID = &productID
		}
	}

	if locationIDStr := c.Query("location_id"); locationIDStr != "" {
		if locationID, err := uuid.Parse(locationIDStr); err == nil {
			filters.LocationID = &locationID
		}
	}

	if typeStr := c.Query("type"); typeStr != "" {
		filters.Type = typeStr
	}

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filters.StartDate = &startDate
		}
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			// Add one day to include the entire end date
			endDate = endDate.Add(24 * time.Hour)
			filters.EndDate = &endDate
		}
	}

	if reference := c.Query("reference"); reference != "" {
		filters.Reference = reference
	}

	movements, total, err := h.stockMovementService.GetAll(page, limit, filters)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  movements,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *StockMovementHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid movement ID",
		})
	}

	movement, err := h.stockMovementService.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Stock movement not found",
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  movement,
	})
}

func (h *StockMovementHandler) GetByProduct(c *fiber.Ctx) error {
	productID, err := uuid.Parse(c.Params("productId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid product ID",
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	movements, total, err := h.stockMovementService.GetByProductID(productID, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  movements,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}
