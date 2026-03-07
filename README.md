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

## Tech stack

- [Vue 3](https://vuejs.org/) with `<script setup>` Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
