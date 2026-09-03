# Graph Visualizer

A browser-based graph visualizer with a React frontend and a small FastAPI backend. Enter nodes and edges as text, and the frontend renders them on an interactive canvas with a lightweight force-directed layout.

## Features

- Define standalone nodes or edges in a compact line-based format.
- See the graph update as you type.
- Drag nodes while the force simulation continues to settle the layout.
- Pan and zoom the canvas with the standard React Flow interactions.
- See active node and edge counts in the sidebar.
- Receive inline validation markers for malformed input.
- Use the backend health endpoint and interactive OpenAPI documentation.
- Responsive sidebar behavior for desktop and mobile-sized screens.

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py          # FastAPI application and routes
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Uvicorn development entry point
└── frontend/
    ├── src/
    │   ├── components/      # Sidebar and custom graph node
    │   ├── physics/         # Force-directed layout engine
    │   ├── styles/          # Shared visual theme
    │   ├── types/           # TypeScript graph types
    │   ├── App.tsx          # Main graph application
    │   └── main.tsx         # React entry point
    ├── package.json
    └── vite.config.ts
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer with npm
- A modern browser

## Quick Start

Run the backend and frontend in separate terminals.

### 1. Start the backend

PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python run.py
```

Command Prompt:

```bat
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python run.py
```

The API starts at `http://127.0.0.1:8000`. Development reload is enabled by `run.py`.

### 2. Start the frontend

In a second terminal from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Vite normally serves the application at `http://localhost:5173`. Open that URL in a browser.

The backend allows requests from the default Vite origin, `http://localhost:5173`. If the frontend runs on another port, update `allow_origins` in `backend/app/main.py`.

## Graph Input Format

The editor accepts one item per line:

```text
A
B
C
A B
B C
```

A line containing one token defines a standalone node. A line containing two tokens defines an edge and automatically adds both endpoint nodes if they are not already defined.

### Validation rules

- Labels must contain between 1 and 3 characters.
- Labels cannot contain whitespace.
- An edge must contain exactly two node labels separated by one space.
- Self-edges such as `A A` are not allowed.
- Duplicate node definitions are rejected.
- Duplicate edges are rejected regardless of endpoint order, so `A B` and `B A` describe the same edge.
- Empty lines are allowed.
- Invalid lines are marked in the editor gutter and do not add graph data.

The graph is parsed locally in the frontend on every text change. The current backend does not persist or calculate graph data.

## Backend

The backend is a FastAPI application served by Uvicorn.

### Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Returns a welcome message with links to health and API docs. |
| `GET` | `/api/health` | Returns the service status. |
| `GET` | `/docs` | Opens FastAPI's Swagger UI. |
| `GET` | `/redoc` | Opens FastAPI's ReDoc documentation. |

Example health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Graph Visualizer API is running"
}
```

### Backend development notes

- Dependencies are pinned in `backend/requirements.txt`.
- `backend/run.py` binds to `127.0.0.1:8000` and enables reload mode.
- CORS currently permits only `http://localhost:5173`.
- There are no database, authentication, or persistence layers.

## Frontend

The frontend uses React 19, TypeScript, Vite, `@xyflow/react`, and `lucide-react`.

### Available scripts

Run these commands from `frontend/`:

```powershell
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run lint      # Run Oxlint
npm run preview   # Serve the production build locally
```

### Frontend behavior

- `App.tsx` owns the graph state and connects the editor to React Flow.
- `Sidebar.tsx` parses the input and displays validation statuses and counts.
- `CustomCircleNode.tsx` renders the circular node appearance.
- `forceEngine.ts` applies pairwise repulsion, center gravity, damping, and drag state.
- `theme.ts` contains shared colors, dimensions, typography, and breakpoints.
- `index.css` provides global layout and React Flow control styling.

The current frontend uses inline styles for component-specific styling and has no frontend test suite configured yet.

## Production Build

Build the frontend and preview it locally:

```powershell
cd frontend
npm run build
npm run preview
```

The generated static assets are written to `frontend/dist/`. The backend remains a separate service and must be deployed or run independently if API functionality is expanded.

## Troubleshooting

### The frontend cannot reach the backend

Confirm that the backend is running on `127.0.0.1:8000`, then visit `/api/health` directly. If the frontend is using a non-default Vite port, add that exact origin to the CORS configuration in `backend/app/main.py`.

### PowerShell blocks virtual-environment activation

Run PowerShell with an appropriate execution policy for your user, or use Command Prompt and activate the environment with `.venv\\Scripts\\activate`.

### The graph appears empty

Check the editor gutter for validation markers. Use labels of one to three non-whitespace characters and edges with exactly one space, such as `A B`.

## License

No license file is currently included in this repository.
