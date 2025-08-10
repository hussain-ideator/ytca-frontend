package main

import (
	"log"

	"yt-insights/backend/internal/trends"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Gin router
	router := gin.Default()

	// Create API v1 group
	v1 := router.Group("/api/v1")

	// Initialize trends service and handler
	trendsService := trends.NewService()
	trendsHandler := trends.NewHandler(trendsService)

	// Register trends routes
	trendsHandler.RegisterRoutes(v1)

	// Start the server
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
