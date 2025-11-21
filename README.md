# HarborPilot – Docker Management Interface

HarborPilot is a professional-grade Docker dashboard that combines a modern React SPA with a lightweight Node/Express API. It centralises container, image, volume, and network management, offers real-time host telemetry, streaming logs, an interactive console, and polished UX patterns built with shadcn/ui. Run it next to your Docker host (or behind an HTTPS proxy) and control everything from a single pane of glass.

## Key Features

- **Comprehensive dashboard** with host stats, alerts, trends, and recent activity.
- **Container management**: search/filter, lifecycle controls, details pane with logs/events/console.
- **Images, volumes, and networks** CRUD tooling (pull/build/prune/delete).
- **Global log viewer** streaming multiple containers simultaneously.
- **Theme & preferences** plus toasts/confirmations for safe operations.

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Zustand, shadcn/ui, Tailwind CSS.
- **Backend**: Node 18, Express 5, native fetch proxying to Docker’s HTTP API.
- **Tooling**: Bun, TypeScript, tsx, ESLint, Recharts, Lucide icons.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.1+ and Node.js 18+ (for the backend).
- Access to a Docker daemon via its HTTP API (local socket exposed through Caddy, SSH tunnel, VPN, etc.).

### Installation

```bash
git clone https://github.com/amartin-ursall/harborpilot-docker-management-interface.git
cd harborpilot-docker-management-interface
bun install
```

### Environment variables (backend/API)

Create a `.env` file in the project root (or export values before running):

```
# URL that the Express API will use to reach Docker
DOCKER_API_BASE=https://docker.my-company.internal
DOCKER_API_USERNAME=optional_username
DOCKER_API_PASSWORD=optional_password
# OR DOCKER_API_BASIC_AUTH / DOCKER_API_BEARER_TOKEN
DOCKER_API_ALLOW_INSECURE=0   # Use 1 to skip TLS verification (self-signed)
HOST_DISK_TOTAL_GB=1000
SERVER_PORT=4001
```

Use whichever auth mechanism matches your proxy (Basic auth, bearer token, etc.). Set `DOCKER_API_ALLOW_INSECURE=1` únicamente cuando uses un proxy HTTPS con certificados self-signed (por ejemplo, Caddy con `tls internal`). En entornos de producción deja ese valor en `0`.

> **Nota:** para el frontend (Vite/Electron) define también `VITE_API_BASE_URL=http://localhost:4001/api` (ajusta el puerto según tu backend) para evitar que en producción intente consultar otro host.

- **Electron desktop (dev)**: `bun run dev:desktop` – same que arriba pero abre la app dentro de Electron (con DevTools). Ideal para validar la versión de escritorio sin compilar nada.
- **Full stack (browser)**: `bun run dev` – corre API (puerto 4001) + Vite (3001). `/api/*` se proxya automáticamente.
- **Only the frontend**: `bun run dev:client`
- **Only the API**: `bun run dev:server`

## Build & start (navegador)

```bash
bun run build          # builds server (dist/server) + frontend (dist)
bun run start          # starts the compiled Express API (serves /api); host the dist/ assets however you prefer
```

Serve the `dist/` folder with any static host (NGINX, CDN, S3, etc.) and keep the Express API running (systemd, PM2, Docker, etc.). The frontend expects `VITE_API_BASE_URL` (defaults to `/api`) if the API lives elsewhere.

## Desktop (Electron)

- **Modo desarrollo**: `bun run dev:desktop`. Arranca API + Vite + Electron (cargando `http://localhost:3001`).
- **Modo producción**:
  ```bash
  bun run build          # genera dist/ + dist/server
  bun run start:desktop  # lanza Electron y, si NODE_ENV=production, arranca el backend compilado
  ```
  Electron carga `dist/index.html` y, fuera de desarrollo, ejecuta `node dist/server/index.js` en un proceso hijo. Cierra la app para detener el backend.

## Available scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Run API + Vite dev server concurrently |
| `bun run dev:server` | Run only the Express API (tsx) |
| `bun run dev:client` | Run only the Vite dev server |
| `bun run dev:desktop` | Run API + Vite + Electron (desktop dev) |
| `bun run build` | Compile the API (`tsc`) and frontend (`vite build`) |
| `bun run build:server` | Compile only the API to `dist/server` |
| `bun run start` | Start the compiled API in production mode |
| `bun run start:server` | Alias for running the compiled API |
| `bun run start:desktop` | Launch Electron in production mode (loads dist/) |
| `bun run lint` | ESLint with JSON output cache |
| `bun run preview` | Build + serve the static frontend via `vite preview` |

## Configurar el acceso a la API de Docker

Necesitas exponer el socket de Docker de forma segura (HTTPS) para que el backend pueda comunicarse.

### 1. Publica el socket con Caddy

1. Instala [Caddy](https://caddyserver.com) en el host que corre Docker.
2. Crea un `Caddyfile` (ej. `C:\caddy\Caddyfile`) como:
   ```
   :2377 {
     reverse_proxy unix//var/run/docker.sock {
       header_up Host {http.request.host}
       header_up X-Forwarded-Proto {scheme}
       header_up X-Forwarded-For {remote}
     }
     tls internal
     log {
       output file C:/caddy/caddy.log
     }
   }
   ```
3. Ejecuta `caddy run --config Caddyfile`. Ahora `https://TU_HOST:2377` reenvía peticiones al socket `/var/run/docker.sock` con TLS propio.

### 2. Hazlo accesible (opcionalmente con Cloudflare Tunnel)

- Crea un túnel (`cloudflared tunnel create docker-api-tunnel`) que apunte a `https://127.0.0.1:2377` y asigna un subdominio (`docker.midominio.com`).
- Si prefieres algo directo, abre el puerto 2377 en tu firewall, instala certificados reales y sirve la URL públicamente o a través de tu VPN.

### 3. Actualiza `.env`

```
DOCKER_API_BASE=https://docker.midominio.com
DOCKER_API_USERNAME=...
DOCKER_API_PASSWORD=...
# o DOCKER_API_BEARER_TOKEN
```

### 4. Verifica

```bash
bun run dev
curl http://localhost:4001/api/overview   # Debe devolver telemetry del host
```

Si algo falla, revisa la consola del backend (Express) y el proxy (Caddy/Cloudflare) para validar certificados o credenciales.

## Notas adicionales

- El backend expone `GET /health` y `POST /api/client-errors` para reportes del frontend.
- Si usas otra forma de exponer Docker (SSH, socket directo, TLS nativo), simplemente ajusta `DOCKER_API_BASE` y las credenciales.
- El `Caddyfile` mencionado se guarda en `C:\caddy\Caddyfile` si seguiste los pasos de Windows; adáptalo según tu sistema.
