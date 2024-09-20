#!/bin/bash

# Stop all running containers
echo "Stopping all running containers..."
docker stop $(docker ps -aq)

# Remove all containers
echo "Removing all containers..."
docker rm $(docker ps -aq)

# Remove all volumes
echo "Removing all volumes..."
docker volume rm $(docker volume ls -q)

# Alternatively, you can use 'docker volume prune' to remove unused volumes:
# echo "Pruning unused volumes..."
# docker volume prune -f

echo "Cleanup completed!"
