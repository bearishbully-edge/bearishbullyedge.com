# 📁 BearishBully Edge - Project Structure

## Directory Tree

```
bearishbully-edge/
├── 📄 README.md                    # Main documentation
├── 📄 DEPLOYMENT.md                # Deployment checklist
├── 📄 API.md                       # API documentation
├── 📄 NINJATRADER.md              # NinjaTrader integration guide
├── 📄 package.json                 # Dependencies and scripts
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 next.config.js               # Next.js configuration
├── 📄 tailwind.config.js           # Tailwind CSS configuration
├── 📄 postcss.config.js            # PostCSS configuration
├── 📄 .env.example                 # Environment variables template
├── 📄 .gitignore                   # Git ignore rules
├── 📄 supabase-schema.sql          # Database schema
│
├── 📁 pages/                       # Next.js pages and API routes
│   ├── 📄 _app.tsx                 # App wrapper with global styles
│   ├── 📄 index.tsx                # Main terminal page
│   └── 📁 api/                     # API endpoints
│       └── 📄 volume.ts            # Volume data insertion endpoint
│
├── 📁 components/                  # React components
│   ├── 📄 MainTerminalLayout.tsx   # Main terminal UI layout
│   └── 📄 VolumeWidget.tsx         # Volume delta widget
│
├── 📁 lib/                         # Core library code
│   ├── 📄 supabaseAdmin.ts         # Supabase admin client (server-side)
│   └── 📄 supabaseClient.ts        # Supabase public client (browser-safe)
│
├── 📁 utils/                       # Utility functions
│   └── 📄 validateVolumeBar.ts     # Zod validation schemas
│
├── 📁 types/                       # TypeScript type definitions
│   └── 📄 index.ts                 # Shared types and interfaces
│
├── 📁 styles/                      # Global styles
│   └── 📄 globals.css              # Tailwind + custom styles
│
├── 📁 scripts/                     # Testing and utility scripts
│   ├── 📄 sampleData.json          # Sample volume data
│   ├── 📄 test-api.sh              # Bash API test script
│   └── 📄 test-api.js              # Node.js API test client
│
└── 📁 tests/                       # Test files (future)
    └── (test files will go here)
```

---

## File Descriptions

### Root Configuration Files

#### `package.json`
- Dependencies: Next.js, React, Supabase, Zod, TypeScript
- Scripts: `dev`, `build`, `start`, `lint`, `type-check`, `test`
- Development and production dependencies

#### `tsconfig.json`
- TypeScript compiler options
- Path aliases for imports (`@/components`, `@/lib`, etc.)
- Strict mode enabled for type safety

#### `next.config.js`
- Next.js configuration
- Environment variable exposure
- CORS headers for API routes
- SWC minification enabled

#### `tailwind.config.js`
- Custom BearishBully color palette
- Dark theme configuration
- Custom utility classes and animations
- Font and spacing customization

#### `.env.example`
- Template for environment variables
- Instructions for Supabase setup
- Security notes

#### `supabase-schema.sql`
- Complete database schema
- `volume_data` table definition
- Row Level Security (RLS) policies
- Helper functions
- Indexes for performance

---

### Pages Directory

#### `pages/_app.tsx`
- Next.js app wrapper
- Imports global CSS
- Future: Add global providers (auth, state management)

#### `pages/index.tsx`
- Main terminal landing page
- Imports `MainTerminalLayout` and `VolumeWidget`
- Hero section with feature list
- SEO meta tags

#### `pages/api/volume.ts`
- POST endpoint for volume data insertion
- Request validation using Zod
- Uses `supabaseAdmin` for privileged writes
- Detailed error responses
- Supports batch insertion (1-1000 bars)

---

### Components Directory

#### `MainTerminalLayout.tsx`
**Purpose**: Professional trading terminal UI

**Features**:
- Top navigation bar with panel toggles
- Left panel: Watchlist (MNQ, NQ, ES, etc.)
- Center panel: Chart area (TradingView placeholder)
- Right panel: Analytics (Volume Widget, Bias, Calendar, COT)
- Bottom panel: Volume Heatmap placeholder
- Dark theme with BearishBully color scheme
- Responsive and keyboard accessible

**Props**:
- `children`: Chart component (future TradingView integration)
- `volumeWidget`: React node for volume widget

#### `VolumeWidget.tsx`
**Purpose**: Real-time volume delta display

**Features**:
- Fetches aggregate delta from Supabase
- Displays total delta with color-coded bias
- Sparkline visualization (last 20 data points)
- Real-time WebSocket subscription
- Auto-refresh every 30 seconds
- Loading and error states
- Bullish/Bearish/Neutral bias detection

**Props**:
- `symbol`: Trading symbol (default: "MNQ")
- `minutes`: Lookback period (default: 60)
- `refreshInterval`: Auto-refresh rate in ms (default: 30000)

---

### Library Directory

#### `lib/supabaseAdmin.ts`
**Purpose**: Server-side Supabase client

**Usage**: API routes only (never in browser)

**Features**:
- Uses `SUPABASE_SERVICE_ROLE_KEY`
- Bypasses Row Level Security
- Type-safe helper functions:
  - `insertVolumeData(data)`
  - `insertVolumeBatch(bars)`
  - `getLatestDelta(symbol, minutes)`
  - `getVolumeSummary(symbol, timeframe)`

**Security**: Never expose to frontend

#### `lib/supabaseClient.ts`
**Purpose**: Browser-safe Supabase client

**Usage**: React components, client-side code

**Features**:
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Respects Row Level Security
- Read-only for volume data
- Real-time subscription support
- Helper functions:
  - `fetchVolumeData(symbol, limit, timeframe)`
  - `fetchVolumeDataRange(symbol, start, end, timeframe)`
  - `getAggregateDelta(symbol, minutes)`
  - `subscribeToVolumeData(symbol, callback)`

---

### Utils Directory

#### `utils/validateVolumeBar.ts`
**Purpose**: Input validation using Zod

**Schemas**:
- `VolumeBarSchema`: Single bar validation
- `VolumeBarBatchSchema`: Batch validation (1-1000 bars)

**Functions**:
- `validateVolumeBar(data)`: Returns `{ success, data?, errors? }`
- `validateVolumeBarBatch(data)`: Batch version
- `safeParseVolumeBar(data)`: Returns parsed data or null
- `formatValidationErrors(errors)`: Format for API response

**Validation Rules**:
- Symbol: 2-10 uppercase alphanumeric
- Timestamp: ISO 8601, within last year
- Volumes: Non-negative, finite, max 1e12
- Delta: Must equal `open - close`
- Timeframe: Enum validation
- Source: Enum validation

---

### Types Directory

#### `types/index.ts`
**Purpose**: Shared TypeScript types

**Key Types**:
- `VolumeBar`: Complete volume bar with metadata
- `VolumeBarInput`: Input type for API
- `VolumeSummary`: Aggregated delta statistics
- `ApiResponse<T>`: Generic API response wrapper
- `ValidationError`: Validation error format
- `BiasDirection`: "bullish" | "bearish" | "neutral"
- `VolumeMetrics`: Computed volume analytics
- `WidgetConfig`: Widget configuration options
- `TerminalLayout`: Layout state management

---

### Styles Directory

#### `styles/globals.css`
**Purpose**: Global styles and Tailwind

**Features**:
- Tailwind directives (`@tailwind base/components/utilities`)
- Custom scrollbar styles (dark theme)
- Typography enhancements
- Custom utility classes:
  - `.glow-green`, `.glow-red`, `.glow-blue`
  - `.gradient-text`
  - `.terminal-grid`
- Button component classes
- Input field styles
- Panel and panel-header classes
- Accessibility improvements (focus-visible, reduced-motion)

---

### Scripts Directory

#### `scripts/sampleData.json`
Sample volume data for testing:
- 5 MNQ bars with realistic values
- ISO 8601 timestamps
- Valid delta calculations
- Ready for API testing

#### `scripts/test-api.sh`
Bash script for API testing:
- Color-coded output
- cURL-based POST request
- HTTP status code checking
- JSON response formatting
- Exit codes for CI/CD

#### `scripts/test-api.js`
Node.js test client:
- Sample data test
- Live data generator
- Retry logic example
- Validation helpers
- Can be imported as module

---

## Import Path Aliases

Configured in `tsconfig.json`:

```typescript
import Component from '@/components/Component';
import { supabase } from '@/lib/supabaseClient';
import { validateVolumeBar } from '@/utils/validateVolumeBar';
import type { VolumeBar } from '@/types';
```

---

## Data Flow

```
1. NinjaTrader → POST /api/volume
2. API validates input (Zod)
3. API inserts via supabaseAdmin
4. Database stores with RLS
5. VolumeWidget subscribes (WebSocket)
6. VolumeWidget queries (supabaseClient)
7. UI updates in real-time
```

---

## Future Additions (Phase 2+)

### New Directories
```
├── 📁 hooks/                       # Custom React hooks
│   ├── 📄 useVolumeData.ts
│   ├── 📄 useBiasEngine.ts
│   └── 📄 useEconomicCalendar.ts
│
├── 📁 services/                    # External service integrations
│   ├── 📄 biasEngine.ts
│   ├── 📄 cotService.ts
│   └── 📄 economicCalendar.ts
│
├── 📁 workers/                     # Background jobs
│   ├── 📄 dailyBias.ts
│   └── 📄 cotSync.ts
│
└── 📁 public/                      # Static assets
    ├── 📄 favicon.ico
    └── 📁 images/
```

---

## Key Features by Directory

### `/pages`
✅ Routing and API endpoints
✅ Server-side rendering
✅ API route handlers

### `/components`
✅ Reusable UI components
✅ Terminal layout system
✅ Real-time widgets

### `/lib`
✅ Database clients
✅ External service wrappers
✅ Shared utilities

### `/utils`
✅ Validation schemas
✅ Helper functions
✅ Data transformers

### `/types`
✅ Type safety across codebase
✅ API contract definitions
✅ Component prop types

---

## Best Practices

### File Naming
- Components: PascalCase (`VolumeWidget.tsx`)
- Utilities: camelCase (`validateVolumeBar.ts`)
- Constants: UPPER_SNAKE_CASE
- Types: PascalCase interfaces/types

### Import Order
1. External dependencies (React, Next.js)
2. Internal libraries (`@/lib`)
3. Internal components (`@/components`)
4. Utilities and helpers (`@/utils`)
5. Types (`@/types`)
6. Styles

### Code Organization
- One component per file
- Co-locate related files
- Keep files under 500 lines
- Extract reusable logic to hooks/utils

---

**Last Updated**: November 2025
**Total Files**: 25+ production files
**Lines of Code**: ~3000+ (well-documented)
