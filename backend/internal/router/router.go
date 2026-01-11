package router

import (
	"debozero-wms/backend/internal/config"
	"debozero-wms/backend/internal/handlers"
	"debozero-wms/backend/internal/middleware"
	"debozero-wms/backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	// Initialize services
	authService := services.NewAuthService(db)
	productService := services.NewProductService(db)
	inventoryService := services.NewInventoryService(db)
	locationService := services.NewLocationService(db)
	stockMovementService := services.NewStockMovementService(db)
	purchaseOrderService := services.NewPurchaseOrderService(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	productHandler := handlers.NewProductHandler(productService)
	inventoryHandler := handlers.NewInventoryHandler(inventoryService)
	locationHandler := handlers.NewLocationHandler(locationService)
	stockMovementHandler := handlers.NewStockMovementHandler(stockMovementService)
	purchaseOrderHandler := handlers.NewPurchaseOrderHandler(purchaseOrderService)

	// Public routes
	api := app.Group("/api/v1")
	auth := api.Group("/auth")
	{
		auth.Post("/register", authHandler.Register)
		auth.Post("/login", authHandler.Login)
	}

	// Protected routes
	protected := api.Group("", middleware.AuthMiddleware)
	{
		// Auth routes
		protected.Get("/auth/profile", authHandler.GetProfile)

		// Product routes
		products := protected.Group("/products")
		{
			products.Post("/", productHandler.Create)
			products.Get("/", productHandler.GetAll)
			products.Get("/:id", productHandler.GetByID)
			products.Put("/:id", productHandler.Update)
			products.Delete("/:id", productHandler.Delete)
		}

		// Inventory routes
		inventory := protected.Group("/inventory")
		{
			inventory.Get("/", inventoryHandler.GetAll)
			inventory.Get("/product/:productId", inventoryHandler.GetByProduct)
			inventory.Get("/product/:productId/total", inventoryHandler.GetTotalStock)
			inventory.Post("/adjust", inventoryHandler.AdjustStock)
		}

		// Location routes
		locations := protected.Group("/locations")
		{
			locations.Post("/", locationHandler.Create)
			locations.Get("/", locationHandler.GetAll)
			locations.Get("/:id", locationHandler.GetByID)
			locations.Put("/:id", locationHandler.Update)
			locations.Delete("/:id", locationHandler.Delete)
		}

		// Stock Movement routes
		movements := protected.Group("/stock-movements")
		{
			movements.Get("/", stockMovementHandler.GetAll)
			movements.Get("/:id", stockMovementHandler.GetByID)
			movements.Get("/product/:productId", stockMovementHandler.GetByProduct)
		}

		// Purchase Order routes
		pos := protected.Group("/purchase-orders")
		{
			pos.Post("/", purchaseOrderHandler.Create)
			pos.Get("/", purchaseOrderHandler.GetAll)
			pos.Get("/:id", purchaseOrderHandler.GetByID)
			pos.Put("/:id", purchaseOrderHandler.Update)
			pos.Post("/:id/cancel", purchaseOrderHandler.Cancel)
			pos.Post("/:id/receive", purchaseOrderHandler.Receive)
			pos.Post("/:id/items", purchaseOrderHandler.AddItem)
			pos.Put("/:id/items/:itemId", purchaseOrderHandler.UpdateItem)
			pos.Delete("/:id/items/:itemId", purchaseOrderHandler.DeleteItem)
		}
	}
}
