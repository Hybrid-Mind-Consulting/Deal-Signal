# Deal Signal — Diligence Watchtower

A prototype that demonstrates proactive due-diligence monitoring and governed signal generation for private-equity deal teams.

Deal Signal continuously monitors a curated evidence base (management presentations, financial accounts, regulatory filings, commercial data) and surfaces material contradictions or risks as structured signals — before a deal team would notice them manually.

---

## ⚠️ Important — fictional company and synthetic data

**NovaCura Therapeutics is an entirely fictional company.** All company names, financial figures, regulatory timelines, customer data, signal outputs, confidence scores, and document references in this prototype are synthetic and illustrative. They do not represent any real company, person, or transaction.

Integrations with Sana, Claude (Anthropic), MCP/API connections, workflow execution, and the depicted architecture are **simulated for demonstration purposes**. No live data connections, AI model calls, or external workflows are active in this prototype. Final deployment architecture would be designed and validated against the client's actual systems, security standards, and integration landscape.

---

## What the prototype demonstrates

| Capability | Description |
|---|---|
| **Proactive signal detection** | Automated identification of material changes and contradictions across a monitored evidence base |
| **Governed signal generation** | Signals are scored, evaluated against materiality thresholds, and dispatched through a governed workflow |
| **Watchtower** | Real-time diligence status dashboard showing overall risk, material signals, and live evidence processing |
| **Signal detail** | Structured evidence comparison with source attribution, AI-assisted investigation, and action creation |
| **Deal Brief** | Automatically generated investment-team summary updated as new signals are detected |
| **Ask Watchtower** | Natural-language Q&A grounded in the monitored evidence base |
| **Analysis Trace** | Business and technical views of signal provenance — from evidence ingestion to governed output |

---

## Running locally

This project uses [pnpm workspaces](https://pnpm.io/workspaces) and Node.js 24.

### Prerequisites

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### Start the development server

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/deal-signal run dev
```

Then open `http://localhost:3000` in your browser.

### Production build

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/deal-signal run build
```

Output is written to `artifacts/deal-signal/dist/public/`.

### Type-check

```bash
pnpm --filter @workspace/deal-signal exec tsc --noEmit
```

---

## Project structure

```
artifacts/
  deal-signal/          # Main Deal Signal React/Vite application
    src/
      pages/            # One file per page/view
      components/       # Shared layout and UI components
      data/             # Synthetic mock data (mock.ts)
    vite.config.ts
    package.json
  api-server/           # Express API scaffold (minimal — prototype uses mock data)
design-reference/       # Visual design reference files (not imported by the app at runtime)
```

---

## Technology stack

- **React 18** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** (token-based, dark-mode first)
- **Radix UI** primitives + shadcn/ui component patterns
- **Framer Motion** for animation
- **Wouter** for client-side routing
- **pnpm workspaces** monorepo

---

## Licence and use

This prototype was built for internal demonstration and evaluation purposes. The NovaCura scenario, all associated data, and all depicted outputs are entirely synthetic. Do not use any content from this prototype as factual reference material.
