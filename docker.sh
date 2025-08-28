#!/bin/bash

# Theatre Seat Plan - Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to show usage
show_usage() {
    echo "Theatre Seat Plan - Docker Management"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  build       Build all Docker images"
    echo "  stop        Stop all containers"
    echo "  clean       Remove all containers and images"
    echo "  logs        Show logs from all services"
    echo "  status      Show status of all containers"
    echo "  shell       Open shell in backend container"
    echo "  db          Connect to database"
    echo "  help        Show this help message"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    print_success "Development environment started!"
    echo ""
    echo "🔗 Access URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5001"
    echo "   Database: localhost:5432"
    echo ""
    echo "📊 View logs: $0 logs"
    echo "🛑 Stop: $0 stop"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose up --build -d
    print_success "Production environment started!"
    echo ""
    echo "🔗 Access URLs:"
    echo "   Application: http://localhost"
    echo "   Alternative: http://localhost:3000"
    echo "   API:        http://localhost:5001"
    echo ""
    echo "📊 View logs: $0 logs"
    echo "🛑 Stop: $0 stop"
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    docker-compose -f docker-compose.dev.yml build --no-cache
    print_success "All images built successfully!"
}

# Function to stop containers
stop_containers() {
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "All containers stopped!"
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose down --volumes --rmi all
        docker-compose -f docker-compose.dev.yml down --volumes --rmi all
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show logs
show_logs() {
    echo "Choose environment:"
    echo "1) Development"
    echo "2) Production"
    read -p "Enter choice (1-2): " choice
    
    case $choice in
        1)
            docker-compose -f docker-compose.dev.yml logs -f
            ;;
        2)
            docker-compose logs -f
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Function to show status
show_status() {
    print_status "Container status:"
    docker-compose ps
    docker-compose -f docker-compose.dev.yml ps
    echo ""
    print_status "Docker images:"
    docker images | grep theatre
}

# Function to open shell
open_shell() {
    container_name="theatre_backend_dev"
    if ! docker ps | grep -q $container_name; then
        container_name="theatre_backend"
    fi
    
    if docker ps | grep -q $container_name; then
        print_status "Opening shell in $container_name..."
        docker exec -it $container_name sh
    else
        print_error "Backend container is not running. Start the environment first."
    fi
}

# Function to connect to database
connect_db() {
    db_container="theatre_db_dev"
    if ! docker ps | grep -q $db_container; then
        db_container="theatre_db"
    fi
    
    if docker ps | grep -q $db_container; then
        print_status "Connecting to database..."
        docker exec -it $db_container psql -U postgres -d moviematic
    else
        print_error "Database container is not running. Start the environment first."
    fi
}

# Main script logic
case "${1:-help}" in
    dev)
        check_docker
        start_dev
        ;;
    prod)
        check_docker
        start_prod
        ;;
    build)
        check_docker
        build_images
        ;;
    stop)
        stop_containers
        ;;
    clean)
        clean_up
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    shell)
        open_shell
        ;;
    db)
        connect_db
        ;;
    help|*)
        show_usage
        ;;
esac
