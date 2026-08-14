# AI Operations Assistant — Design Reference

Visual design files extracted from `artifacts/ai-ops-assistant` for use as a reference in other Replit projects. No business logic, API code, or data models are included.

---

## Most Important Files (start here)

| File | What it controls |
|------|-----------------|
| `src/index.css` | **The entire design system.** All CSS custom properties (color tokens, radius, spacing, shadows, typography), both light and dark mode, plus the elevation utility classes. This is the single source of truth for every color and token used in the app. |
| `src/App.tsx` | Top-level layout shell — routing structure, providers (QueryClient, Tooltip, Toaster), and how pages are composed inside the shell. |
| `src/components/ui/button.tsx` | Button variants (default, destructive, outline, ghost, link) and sizes via `class-variance-authority`. |
| `src/components/ui/card.tsx` | Card surface with header, title, description, content, and footer regions. |
| `src/components/ui/input.tsx` | Styled single-line text input. |
| `src/components/ui/sidebar.tsx` | Full sidebar component — rail, inset, collapsible, mobile drawer variant, menu primitives. |
| `src/lib/utils.ts` | `cn()` helper (merges Tailwind classes with `clsx` + `tailwind-merge`). Required by every UI component. |

---

## Color & Token System (`src/index.css`)

The file is structured in three layers:

1. **`@theme inline` block** — maps CSS custom properties to Tailwind's design-token system (e.g. `--color-background: hsl(var(--background))`).
2. **`:root` block** — light-mode HSL values for every token. All values are expressed as bare `H S L` numbers (no `hsl()` wrapper) so they can be composed at runtime.
3. **`.dark` block** — dark-mode overrides for the same tokens.

### Key color tokens (dark-mode values as shipped)
| Token | Role |
|-------|------|
| `--background` | Canvas background — dark graphite (`218 20% 12%`) |
| `--foreground` | Primary text |
| `--primary` | Violet accent (`265 42% 66%`) |
| `--accent` | Teal complete (`176 52% 50%`) |
| `--card` | Elevated surface |
| `--muted` | Subtle/secondary surfaces |
| `--destructive` | Error/danger state |
| `--border` | Dividers and outlines |
| `--ring` | Focus ring |

> **Note:** In the source the `:root` (light-mode) values are intentionally left as `red` placeholders — the app runs in forced dark mode. If you need a real light theme, define the `:root` values before using this as a template.

### Elevation utilities
`index.css` defines a custom elevation system (`.hover-elevate`, `.active-elevate`, `.toggle-elevate`) that overlays translucent backgrounds on hover/active/toggled states without modifying border or background colors directly.

---

## Typography

Fonts are declared via `--app-font-sans`, `--app-font-serif`, and `--app-font-mono` CSS variables in `index.css`. The default sans stack is `'Inter', sans-serif`. Inter is loaded via a `<link>` tag in `index.html`.

---

## Spacing & Radius

| Variable | Value | Used for |
|----------|-------|---------|
| `--radius` | `0.5rem` (8 px) | Base border radius |
| `--radius-sm` | `--radius - 4px` | Tight controls |
| `--radius-md` | `--radius - 2px` | Default controls |
| `--radius-lg` | `--radius` | Cards, panels |
| `--radius-xl` | `--radius + 4px` | Large surfaces |
| `--spacing` | `0.25rem` | Tailwind spacing multiplier |

---

## UI Component Library (`src/components/ui/`)

All components use [Radix UI](https://www.radix-ui.com/) primitives + Tailwind classes composed with `cn()`. They are unstyled at the Radix layer and fully styled here.

| Component | What it covers |
|-----------|---------------|
| `button.tsx` | Buttons — variants & sizes |
| `button-group.tsx` | Segmented/grouped button row |
| `card.tsx` | Card surface with sub-regions |
| `input.tsx` | Text input |
| `textarea.tsx` | Multiline input |
| `select.tsx` | Dropdown select |
| `checkbox.tsx` | Checkbox control |
| `radio-group.tsx` | Radio group |
| `switch.tsx` | Toggle switch |
| `slider.tsx` | Range/value slider |
| `label.tsx` | Form label |
| `field.tsx` | Label + description + error layout |
| `form.tsx` | react-hook-form-integrated field wrapper |
| `input-group.tsx` | Input with leading/trailing addons |
| `badge.tsx` | Status/tag pill |
| `avatar.tsx` | User avatar with fallback |
| `separator.tsx` | Horizontal/vertical divider |
| `tabs.tsx` | Tab bar + content panels |
| `accordion.tsx` | Collapsible content sections |
| `dialog.tsx` | Modal dialog |
| `sheet.tsx` | Slide-over panel |
| `drawer.tsx` | Bottom/side drawer |
| `dropdown-menu.tsx` | Contextual dropdown |
| `context-menu.tsx` | Right-click menu |
| `menubar.tsx` | Horizontal app menubar |
| `navigation-menu.tsx` | Top nav with flyout panels |
| `sidebar.tsx` | App sidebar (rail, full, mobile) |
| `tooltip.tsx` | Hover tooltip |
| `popover.tsx` | Anchored floating panel |
| `hover-card.tsx` | Hover preview card |
| `command.tsx` | Command palette / combobox |
| `table.tsx` | Styled data table |
| `chart.tsx` | Recharts wrapper with theme colours |
| `progress.tsx` | Progress bar |
| `skeleton.tsx` | Loading placeholder blocks |
| `spinner.tsx` | Animated loading spinner |
| `scroll-area.tsx` | Custom scrollbar region |
| `toast.tsx` / `toaster.tsx` | Toast notifications |
| `sonner.tsx` | Sonner toast container (themed) |
| `alert.tsx` | Inline alert banner |
| `alert-dialog.tsx` | Confirmation dialog |
| `pagination.tsx` | Page navigation |
| `breadcrumb.tsx` | Breadcrumb trail |
| `item.tsx` | List item with icon/content/action regions |
| `empty.tsx` | Empty-state layout |
| `kbd.tsx` | Keyboard shortcut keycap |
| `toggle.tsx` / `toggle-group.tsx` | Toggle buttons |
| `collapsible.tsx` | Show/hide container |
| `resizable.tsx` | Resizable panels |
| `calendar.tsx` | Date picker calendar |
| `carousel.tsx` | Scrollable carousel |
| `aspect-ratio.tsx` | Constrained aspect-ratio wrapper |
| `input-otp.tsx` | OTP digit-slot input |

---

## Hooks

| File | Purpose |
|------|---------|
| `src/hooks/use-mobile.tsx` | Returns `true` when viewport width is ≤768 px — used to switch layouts. |
| `src/hooks/use-toast.ts` | State management for the toast queue (pairs with `toaster.tsx`). |

---

## Dependencies required to interpret/reuse these files

```json
"tailwindcss": "^4.x",
"@tailwindcss/vite": "^4.x",
"tw-animate-css": "^1.x",
"@tailwindcss/typography": "^0.5.x",
"class-variance-authority": "^0.7.x",
"clsx": "^2.x",
"tailwind-merge": "^2.x",
"@radix-ui/react-*": "^1–2.x  (one package per component)",
"framer-motion": "^11.x  (used in App.tsx animations)",
"lucide-react": "^0.4x  (icons throughout)",
"@tanstack/react-query": "^5.x  (QueryClientProvider in App.tsx)"
```

Tailwind v4 is configured as a Vite plugin (no `tailwind.config.js` — all configuration lives in `src/index.css` via `@theme` and `@plugin` directives).

---

## What was intentionally excluded

- `src/App.tsx` pipeline node logic, animation sequences, and Q&A panel state
- API client hooks and generated types (`lib/api-client-react/`)
- Backend server code (`artifacts/api-server/`)
- Data models and schema (`lib/db/`, `lib/api-spec/`)
- Build config (`vite.config.ts`, `tsconfig.json`, `package.json`)
