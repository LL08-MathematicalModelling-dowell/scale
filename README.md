# Scale

## Overview

This project is a full-stack web application structured into three main components:

1. **Backend**: Contains the backend code and logic.
2. **Frontend**: Contains the frontend code and user interface.
3. **Nginx**: Configures the server setup for the application.

The project is containerized using Docker, making it easy to deploy and manage.

## Project Structure

- **`backend/`**: Directory containing all backend code, including API routes, database connections, and business logic.
- **`frontend/`**: Directory containing all frontend code, including React components, styles, and assets.
- **`nginx/`**: Directory containing the Nginx configuration files used to serve the application and manage reverse proxy.

## Getting Started

### Prerequisites

1. **Docker Desktop**: Ensure Docker Desktop is installed on your system. If you do not have it installed, you can download it [here](https://www.docker.com/products/docker-desktop).

### Starting the Project

To start the application, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Run the following command to start the backend and frontend containers:

   ```sh
   docker-compose up backend frontend
   ```

   This command will start the backend and frontend services defined in the Docker Compose file.

### URLs

- **Backend API**: The backend API is accessible at [https://www.scales.uxlivinglab.online/api](https://www.scales.uxlivinglab.online/api).
- **Frontend**: The frontend of the application is accessible at [https://www.scales.uxlivinglab.online/](https://www.scales.uxlivinglab.online/).
- **Server Health Page**: You can check the server's health status at [https://www.scales.uxlivinglab.online/server-status](https://www.scales.uxlivinglab.online/server-status).

## GitHub Workflow

To ensure a smooth and collaborative development process, please follow the guidelines below:

1. **Create a Branch from the Main Branch**: 
   - Always create a new branch from the `main` branch when working on a new feature or bug fix.

2. **Branch Naming Convention**:
   - For backend work, use the format: `ft-{feature_name}-backend`
   - For frontend work, use the format: `ft-{feature_name}-frontend`

   Replace `{feature_name}` with a brief description of the feature or fix.

3. **Sync with Main Before Pushing**:
   - Before pushing your changes, make sure to pull the latest changes from the `main` branch to avoid merge conflicts.

   ```sh
   git pull origin main
   ```

4. **Raise a Pull Request (PR)**:
   - Once your changes are ready, push them to your branch and raise a PR to merge your branch into `main`.
   - Make sure to provide a clear and concise description of what your PR does.

5. **Add a Reviewer**:
   - Assign at least one reviewer to your PR to ensure that your changes are reviewed before merging.

By following these steps, we ensure that the codebase remains clean, organized, and easy to manage.