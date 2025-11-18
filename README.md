# HarborPilot - Docker Management Interface

HarborPilot is a professional-grade, visually stunning web UI for Docker, built to run on the Cloudflare edge network. It provides a comprehensive dashboard for at-a-glance monitoring of host resources and container states. The application features detailed management views for containers, images, volumes, and networks, alongside interactive tools like a real-time log viewer and an integrated web console. The design prioritizes clarity, efficiency, and visual excellence, with an information-dense layout that empowers developers and DevOps engineers to manage their containerized applications with precision and ease. Its responsive, modern interface ensures a seamless experience across all devices.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/amartin-ursall/harborpilot-docker-management-interface)

## ✨ Key Features

-   **Comprehensive Dashboard**: Get a high-level overview of your Docker host's status, including summary statistics and real-time resource utilization charts.
-   **Container Management**: A detailed table view to manage all containers. Search, filter, and perform actions like start, stop, restart, view logs, and access the console.
-   **Detailed Container View**: A tabbed side-panel showing a container's overview, real-time stats, logs, an interactive console, and raw inspection data.
-   **Image Management**: A dedicated view for all Docker images. Pull, build, prune, and delete images, or create new containers from them.
-   **Volume & Network Management**: List views for managing Docker volumes and networks, showing their configuration and usage.
-   **Global Logs**: A centralized log viewer to stream, filter, and search logs from multiple containers simultaneously.
-   **Host & Settings Management**: Configure Docker host connections and application preferences like theme and refresh intervals.

## 🚀 Technology Stack

-   **Frontend**: React, Vite, React Router
-   **Styling**: Tailwind CSS, shadcn/ui
-   **State Management**: Zustand
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   **Animation**: Framer Motion
-   **Backend/Edge**: Hono on Cloudflare Workers

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/harborpilot.git
    cd harborpilot
    ```

2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```bash
    bun install
    ```

## 💻 Development

To start the local development server, which includes both the Vite frontend and the Hono backend on Cloudflare Workers, run:

```bash
bun run dev
```

The application will be available at `http://localhost:3000` (or the port specified in your environment). The frontend code is located in the `src` directory, and the Cloudflare Worker backend code is in the `worker` directory.

## 🚀 Deployment

This application is designed to be deployed on the Cloudflare network.

### Deploy with Wrangler CLI

1.  **Authenticate with Cloudflare:**
    If you haven't already, you'll need to log in to your Cloudflare account.
    ```bash
    bunx wrangler login
    ```

2.  **Build and deploy the application:**
    The `deploy` script handles building the Vite frontend and deploying the application using Wrangler.
    ```bash
    bun run deploy
    ```

### Deploy with Cloudflare Button

You can also deploy this project directly to your Cloudflare account by clicking the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/amartin-ursall/harborpilot-docker-management-interface)

## 📜 Available Scripts

-   `bun run dev`: Starts the development server.
-   `bun run build`: Builds the application for production.
-   `bun run lint`: Lints the codebase using ESLint.
-   `bun run deploy`: Builds and deploys the application to Cloudflare Workers.
-   `bun run preview`: Previews the production build locally.