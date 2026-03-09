# Snowboard Catalog

This application displays a paginated list of snowboards fetched from an external API. Users can filter by gender and style, search by name and brand, view product details in a side panel, and perform create, read, update, and delete operations that are simulated in the store (the API does not support write operations).

Web application built with [Vue 3](https://vuejs.org/) (Composition API), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/). The stack includes [Shadcn](https://ui.shadcn.com/) for components and icons, [Pinia](https://pinia.vuejs.org/) for state management, [Tailwind CSS](https://tailwindcss.com/) for styling, [Cypress](https://www.cypress.io/) for E2E testing, and [Vitest](https://vitest.dev/) with [Vue Test Utils](https://test-utils.vuejs.org/) for unit tests.

The [Plan](Plan.md) document outlines the roadmap followed to complete this technical assessment.

## Requirements

- Node.js 20+
- pnpm

## Instructions to run the project

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm run dev
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
├── cypress/                            # E2E tests (Cypress)
│   ├── e2e/                            # Test specs (snowboards.cy.ts)
│   ├── fixtures/                       # Mock data (snowboards.json)
│   └── support/                        # Custom commands and setup
├── public/                             # Static assets served as-is
├── src/
│   ├── api/                            # API calls and data fetching logic
│   ├── assets/                         # Images, fonts, and other static assets
│   ├── components/
│   │   └── ui/                         # shadcn-vue UI components (table, button, input, badge…)
│   ├── lib/
│   │   └── utils.ts                    # Shared utilities (cn, etc.)
│   ├── pages/
│   │   └── ListPage/                   # Product list page
│   │       ├── ListPage.vue
│   │       └── components/
│   │           ├── CategoryFilters/    # Filter by category
│   │           ├── DetailsSidepanel/   # Side panel with product details
│   │           └── SnowboardsTable/    # TanStack Table implementation
│   ├── router/
│   │   └── index.ts                    # Vue Router configuration
│   ├── types/
│   │   └── snowboard.ts                # TypeScript types
│   ├── App.vue                         # Root component
│   ├── main.ts                         # Application entry point
│   └── style.css                       # Global styles
├── cypress.config.ts                   # Cypress configuration
├── vite.config.ts                      # Vite configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
└── index.html                          # HTML entry point
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

Product details open in a side panel instead of navigating to a separate page. This keeps the full product list visible while the user reviews a specific item, making it easy to compare or move between entries without losing context.

A side panel is also sufficient to display all the relevant product information, so the added complexity of a dedicated route and page is not justified. There is no need to run a separate `GET /products/:id` for the details: the data is already available from the list read, so we avoid an extra request and any loading delay when opening the panel.

**Trade-off.** With this approach, the details shown in the panel may be out of sync with the backend. For this use case, I considered it unnecessary to add an extra request because the data is not modified.

### Improvements

- Using GraphQL with a data source allows you to optimize requests from the frontend to only load the necessary data, which makes it more efficient in my experience.
- Add images for the detail view.
- The toast informs the user whether their request succeeded or failed. Always provide feedback to the user.

## AI tools

I used OpenCode and Cursor (in both agent and plan modes) to speed up development, always reviewing the agents’ suggestions to ensure they aligned with my intent and met the quality bar for the product.

Models used:

- **Composer 1.5** — Small changes, bug fixes, and refactors
- **Gemini 3.1 Pro** — Questions, planning, and verification

All work was done under my supervision. The codebase is not 100% AI-generated; I wrote significant portions myself and validated every change before accepting it.
