package handlers

import (
	"debozero-wms/backend/internal/models"
	"debozero-wms/backend/internal/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type LocationHandler struct {
	locationService *services.LocationService
}

func NewLocationHandler(locationService *services.LocationService) *LocationHandler {
	return &LocationHandler{locationService: locationService}
}

func (h *LocationHandler) Create(c *fiber.Ctx) error {
	var location models.Location
	if err := c.BodyParser(&location); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := h.locationService.Create(&location); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error": false,
		"data":  location,
	})
}

func (h *LocationHandler) GetAll(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	locations, total, err := h.locationService.GetAll(page, limit, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  locations,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *LocationHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid location ID",
		})
	}

	location, err := h.locationService.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Location not found",
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  location,
	})
}

func (h *LocationHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid location ID",
		})
	}

	var location models.Location
	if err := c.BodyParser(&location); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := h.locationService.Update(id, &location); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	updatedLocation, _ := h.locationService.GetByID(id)
	return c.JSON(fiber.Map{
		"error": false,
		"data":  updatedLocation,
	})
}

func (h *LocationHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid location ID",
		})
	}

	if err := h.locationService.Delete(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Location deleted successfully",
	})
}
