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

## Project structure

```
├── cypress/                 # E2E tests (Cypress)
│   ├── e2e/                 # Test specs
│   ├── fixtures/            # Mock data
│   └── support/             # Custom commands and setup
├── public/                  # Static assets served as-is
├── src/
│   ├── assets/              # Images, fonts, and other static assets
│   ├── components/          # Reusable Vue components
│   ├── App.vue              # Root component
│   ├── main.ts              # Application entry point
│   └── style.css            # Global styles
├── cypress.config.ts        # Cypress configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── index.html               # HTML entry point
```

## Key technical decisions

### TanStack Table for product listing

The product list uses [TanStack Table](https://tanstack.com/table) instead of a hand-rolled table component. Three reasons drove this decision:

**Scalability.** The current feature set covers search and pagination, but sorting by price, row selection with checkboxes, or grouping by brand are foreseeable requirements. TanStack Table ships all of this out of the box, so adding those features is a matter of configuration rather than new code.

**Maintainability.** The component stays focused on rendering — where each piece of data goes and how it looks. The logic for filtering, sorting, and paginating rows is delegated to a well-tested library, which keeps the component lean and easy to reason about.

**Pragmatism.** TanStack Table is the industry standard for headless table logic in both React and Vue ecosystems. Reaching for it avoids reinventing solved problems and means the solution is familiar to any developer joining the project.

## Tech stack

- [Vue 3](https://vuejs.org/) with `<script setup>` Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
