#!/bin/bash

# Theatre Seat Plan - Docker Test Script

echo "🧪 Testing Docker Setup..."
echo "=========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Test building images
echo "🔨 Testing image builds..."
if docker-compose -f docker-compose.dev.yml build --quiet; then
    echo "✅ Development images built successfully"
else
    echo "❌ Failed to build development images"
    exit 1
fi

if docker-compose build --quiet; then
    echo "✅ Production images built successfully"
else
    echo "❌ Failed to build production images"
    exit 1
fi

echo ""
echo "🎉 Docker setup test completed successfully!"
echo ""
echo "Next steps:"
echo "  ./docker.sh dev    # Start development environment"
echo "  ./docker.sh prod   # Start production environment"
echo "  ./docker.sh help   # View all commands"
