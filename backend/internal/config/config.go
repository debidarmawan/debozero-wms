package config

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

type Config struct {
	DatabaseURL    string
	JWTSecret      string
	JWTExpiration  int
	AllowedOrigins string
	Port           string
}

func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/debozero_wms?sslmode=disable"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiration:  24, // hours
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3001"),
		Port:           getEnv("PORT", "3000"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func ErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"error":   true,
		"message": message,
		"code":    code,
	})
}
