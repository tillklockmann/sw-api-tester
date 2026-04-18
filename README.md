# SW API Tester

A developer tool for testing Shopware 6 Admin API and Store API endpoints. Built with Vue 3, TypeScript, and Tailwind CSS.

## Features

- **Admin API & Store API** support with version toggle (6.6 / 6.7)
- **OpenAPI-driven endpoint selector** with grouped search (Entities, Search, Aggregate, Actions)
- **Auto-generated request bodies** from OpenAPI schemas for POST/PUT/PATCH endpoints
- **OAuth authentication** with automatic token refresh for Admin API
- **Shop instance management** — save multiple shop configurations (URL, credentials, version) and switch between them via dropdown
- **Saved requests** — save named request configurations grouped by endpoint, loadable against any shop instance
- **Convenience builders** for Sync API payloads, Search Criteria, and Custom Prices
- **Request history** with click-to-replay
- **JSON editor** with syntax highlighting (CodeMirror 6)
- **Draggable split pane** between request and response panels

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

### Connecting to a Shop

**Option A — Manual:** Enter the base URL and credentials directly in the connection bar.

**Option B — Saved shops:** Click **+ Add** to save a shop configuration (name, URL, version, Client ID, Client Secret, Access Key). Select it from the dropdown to auto-populate the connection fields. Saved shops are stored in `.api-tester/shops.json` on disk.

For Admin API, click **Connect** to authenticate via OAuth. For Store API, provide the `sw-access-key` — no explicit connect step needed.

### Making Requests

1. Select an endpoint from the searchable dropdown or type a custom path
2. Choose the HTTP method (GET, POST, PUT, PATCH, DELETE)
3. Edit the request body, headers, or query params in the tabbed editor
4. Press **Send** or `Cmd+Enter` / `Ctrl+Enter`

### Saving Requests

Click **Save** next to the Send button to save the current request configuration with a name. Saved requests remember the endpoint, method, body, headers, query params, and which shop they were originally created with. Click the **Saved** button to browse and load saved requests. Saved requests are stored in `.api-tester/saved-requests.json` on disk.

### Convenience Builders

- **Sync** tab — build Sync API payloads with entity/action selection
- **Search** tab — construct Search Criteria with filters, sorting, associations
- **Custom Price** tab — build Custom Price rule payloads

## Data Storage

Shop configurations and saved requests are stored as JSON files in the `.api-tester/` directory (gitignored). This makes them browser-independent and persistent across browser data clearing. The Vite dev server provides read/write endpoints for these files.

Request history and connection state use browser localStorage via Pinia.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript** (strict mode)
- **Pinia** (state management + persisted state plugin)
- **Tailwind CSS 4** (dark theme with custom design tokens)
- **Headless UI** (Combobox, Dialog)
- **CodeMirror 6** (JSON editor with One Dark theme)
- **Vite 6** (dev server + build)

## Project Structure

```
src/
├── components/
│   ├── common/        # BaseModal, JsonEditor, KeyValueEditor, TabBar
│   ├── connection/    # ConnectionPanel, ConnectionStatus
│   ├── convenience/   # SyncApiBuilder, SearchCriteriaBuilder, CustomPriceBuilder
│   ├── history/       # HistoryPanel, HistoryEntry
│   ├── layout/        # AppHeader, SplitPane
│   ├── request/       # RequestBuilder, EndpointSelector, MethodSelector, SendButton
│   ├── response/      # ResponsePanel, StatusBadge
│   ├── saved/         # SaveRequestModal, SavedRequestsPanel
│   └── shops/         # ShopSelector, ShopFormModal, ShopDeleteConfirm
├── services/          # API execution, auth, OpenAPI parsing, config storage
├── stores/            # Pinia stores (connection, request, response, history, shops, saved-requests, openapi)
├── types/             # TypeScript interfaces
└── specs/             # Bundled OpenAPI specs (v6.6, v6.7)
```

## Build

```bash
npm run build    # type-check + production build
npm run preview  # preview production build
```
