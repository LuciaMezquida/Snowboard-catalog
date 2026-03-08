# Snowboard Catalog

A web application built with Vue 3, TypeScript, and Vite.

## Requirements

- Node.js 18+
- npm

## Instructions to run the project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run unit tests:

```bash
pnpm test
```

To run a specific test file:

```bash
pnpm test src/pages/ListPage/components/CategoryFilters/CategoryFilters.spec.ts
```

Run E2E tests (start the dev server first with `pnpm dev` in another terminal):

```bash
pnpm test:e2e
```

Or open Cypress interactively:

```bash
pnpm test:e2e:open
```

## Project structure

```
├── cypress/                        # E2E tests (Cypress)
│   ├── e2e/                        # Test specs (snowboards.cy.ts)
│   ├── fixtures/                   # Mock data (snowboards.json)
│   └── support/                    # Custom commands and setup
├── public/                         # Static assets served as-is
├── src/
│   ├── api/                        # API calls and data fetching logic
│   ├── assets/                     # Images, fonts, and other static assets
│   ├── components/
│   │   └── ui/                     # shadcn-vue UI components (table, button, input, badge…)
│   ├── lib/
│   │   └── utils.ts                # Shared utilities (cn, etc.)
│   ├── pages/
│   │   └── ListPage/               # Product list page
│   │       ├── ListPage.vue
│   │       └── components/
│   │           ├── CategoryFilters/    # Filter by category
│   │           ├── DetailsSidepanel/   # Side panel with product details
│   │           └── SnowboardsTable/    # TanStack Table implementation
│   ├── router/
│   │   └── index.ts                # Vue Router configuration
│   ├── types/
│   │   └── snowboard.ts            # TypeScript types
│   ├── App.vue                     # Root component
│   ├── main.ts                     # Application entry point
│   └── style.css                   # Global styles
├── cypress.config.ts               # Cypress configuration
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── index.html                      # HTML entry point
```

## Key technical decisions

### TanStack Table for product listing

The product list uses [TanStack Table](https://tanstack.com/table) instead of a hand-rolled table component. Three reasons drove this decision:

**Scalability.** The current feature set covers search and pagination, but sorting by price, row selection with checkboxes, or grouping by brand are foreseeable requirements. TanStack Table ships all of this out of the box, so adding those features is a matter of configuration rather than new code.

**Maintainability.** The component stays focused on rendering — where each piece of data goes and how it looks. The logic for filtering, sorting, and paginating rows is delegated to a well-tested library, which keeps the component lean and easy to reason about.

**Pragmatism.** TanStack Table is the industry standard for headless table logic in both React and Vue ecosystems. Reaching for it avoids reinventing solved problems and means the solution is familiar to any developer joining the project.

### Create and update handled in the frontend

DummyJSON does not support POST or PUT. Create and update are therefore handled entirely in the frontend: the store maintains `localCreated` and `localUpdated` state, merges it with API data when loading, and the UI behaves as if mutations were persisted. Reads still come from the API; writes are local-only.

### Side panel for product details

Product details open in a side panel instead of navigating to a separate page. This keeps the full product list visible while the user reviews a specific item, making it easy to compare or move between entries without losing context. A side panel is also sufficient to display all the relevant product information, so the added complexity of a dedicated route and page is not justified. There is no need to run a separate `GET /products/:id` for the details: the data is already available from the list read, so we avoid an extra request and any loading delay when opening the panel.

## Tech stack

- [Vue 3](https://vuejs.org/) with `<script setup>` Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
