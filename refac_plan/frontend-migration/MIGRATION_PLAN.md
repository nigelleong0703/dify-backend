# Dify Frontend Migration Plan - Next.js Fast Track

## Overview

**Goal:** Build a custom Dify frontend FAST by using Next.js 15 (same as Dify) and directly adapting their code.

**Strategy:** Copy → Strip Branding → Customize

**Timeline:** 2-3 weeks for MVP (auth + apps + chat)

---

## Phase 0: Foundation (Day 1)

### Setup Next.js Project

**Create Project:**
```bash
pnpm create next-app@latest frontend --typescript --tailwind --app --no-src-dir
cd frontend
```

**Install Dify's Dependencies:**
```bash
# UI & Styling
pnpm add @headlessui/react @heroicons/react tailwind-merge classnames

# State & Data
pnpm add @tanstack/react-query @tanstack/react-query-devtools zustand

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# HTTP & Utils
pnpm add ky js-cookie ahooks dayjs lodash-es

# Dev dependencies
pnpm add -D @types/js-cookie @types/lodash-es
```

**Copy Config Files from Dify:**

1. **Tailwind Config** - Copy `web/tailwind.config.js` → `frontend/tailwind.config.ts`
   - Update content paths to match your structure
   - Keep their theme, colors, plugins

2. **TypeScript Config** - Copy `web/tsconfig.json` → `frontend/tsconfig.json`
   - Update paths
   - Keep strict mode settings

3. **PostCSS** - Copy `web/postcss.config.js` → `frontend/postcss.config.js`

**Environment Variables** - Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME=MyDify
```

**Test:**
```bash
pnpm dev
# Visit http://localhost:3000
```

---

## Phase 1: Core Infrastructure (Day 1-2)

### 1.1 Copy Service Layer

**Goal:** Get API client working

**Copy These Files:**
```
web/service/base.ts → frontend/service/base.ts
web/service/common.ts → frontend/service/common.ts
web/service/fetch.ts → frontend/service/fetch.ts
web/config/index.ts → frontend/config/index.ts (API URLs)
```

**Adapt:**
- Update `API_PREFIX` to use `NEXT_PUBLIC_API_URL`
- Remove Sentry references (or keep if you want)
- Update cookie names if needed
- Test with a simple API call

**Create `frontend/service/index.ts`:**
```typescript
export * from './base'
export * from './common'
```

### 1.2 Copy Type Definitions

**Copy These Files:**
```
web/models/common.ts → frontend/types/common.ts
web/types/app.ts → frontend/types/app.ts
```

**Adapt:**
- Keep all type definitions
- These are just TypeScript interfaces, safe to copy

### 1.3 Copy Utility Functions

**Copy:**
```
web/utils/ → frontend/lib/
```

**Key files:**
- `utils/format.ts` - Date/number formatting
- `utils/var.ts` - Environment variables
- `utils/index.ts` - General utilities

---

## Phase 2: Authentication (Day 2-3)

### 2.1 Copy Login Page

**Copy Structure:**
```
web/app/signin/ → frontend/app/signin/
```

**Files to copy:**
- `page.tsx` - Main signin page
- `normal-form.tsx` - Email/password form
- `layout.tsx` - Signin layout
- `page.module.css` - Styles

**Adapt:**
1. **Remove Dify branding:**
   - Replace logo with yours
   - Update page title
   - Remove copyright footer or replace with yours

2. **Simplify if needed:**
   - Remove SSO options if you don't need them
   - Remove "Sign in with Google" etc.
   - Keep email/password form

3. **Update API calls:**
   - Should work as-is if you copied service layer
   - Test login endpoint

**Test:**
- Visit `/signin`
- Try logging in with test credentials
- Check if token is stored
- Verify redirect after login

### 2.2 Copy Auth Context/Hooks

**Copy:**
```
web/context/ → frontend/context/
```

Look for auth-related context providers.

**Or create your own simple version:**
```typescript
// frontend/context/auth-context.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for token in localStorage/cookies
    const token = localStorage.getItem('console_token')
    setIsAuthenticated(!!token)
  }, [])

  const login = (token: string) => {
    localStorage.setItem('console_token', token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('console_token')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 2.3 Copy Root Layout

**Copy:**
```
web/app/layout.tsx → frontend/app/layout.tsx
```

**Adapt:**
- Remove Dify branding
- Keep React Query provider
- Keep Tailwind imports
- Update metadata (title, description)
- Remove analytics if you don't need them

---

## Phase 3: Main Layout & Navigation (Day 3-4)

### 3.1 Copy Main Layout

**Copy:**
```
web/app/(commonLayout)/ → frontend/app/(dashboard)/
```

This includes:
- `layout.tsx` - Main app layout with sidebar
- Sidebar component
- Header component

**Adapt:**
1. **Remove Dify branding:**
   - Logo
   - Product name
   - Links to Dify docs/community

2. **Simplify navigation:**
   - Keep: Apps, Datasets, Tools
   - Remove: Features you don't need

3. **Update routes:**
   - Make sure paths match your structure

### 3.2 Copy Sidebar Component

**Copy:**
```
web/app/components/app-sidebar/ → frontend/components/sidebar/
```

**Adapt:**
- Update navigation items
- Remove upgrade prompts
- Update icons if needed

### 3.3 Copy Header Component

**Copy:**
```
web/app/components/header/ → frontend/components/header/
```

**Adapt:**
- Remove Dify logo
- Keep user menu
- Keep workspace switcher (if you need it)

**Test:**
- Login and see main layout
- Sidebar navigation works
- User menu shows
- Logout works

---

## Phase 4: Apps List (Day 4-5)

### 4.1 Copy Apps Page

**Copy:**
```
web/app/(commonLayout)/apps/ → frontend/app/(dashboard)/apps/
```

**Files:**
- `page.tsx` - Apps list page
- Components for app cards, filters, search

**Adapt:**
- Remove Dify branding
- Keep core functionality
- Test API calls

### 4.2 Copy App Components

**Copy:**
```
web/app/components/apps/ → frontend/components/apps/
```

**Key components:**
- `AppCard` - Individual app card
- `AppList` - List/grid view
- `CreateAppModal` - Create new app

**Adapt:**
- Update styling if needed
- Remove features you don't need
- Keep core create/edit/delete

**Test:**
- View apps list
- Search/filter apps
- Create new app
- Delete app

---

## Phase 5: App Detail & Configuration (Day 5-7)

### 5.1 Copy App Detail Page

**Copy:**
```
web/app/(commonLayout)/app/[appId]/ → frontend/app/(dashboard)/app/[appId]/
```

**This is complex - start with basics:**
- Overview page
- Configuration page
- Logs page (optional)

**Adapt:**
- Remove advanced features initially
- Keep model selection
- Keep prompt editing
- Test saving changes

### 5.2 Copy App Configuration Components

**Copy:**
```
web/app/components/app/ → frontend/components/app/
```

**Start with:**
- Model selector
- Prompt editor
- Basic settings form

**Skip initially:**
- Advanced workflow builder
- Complex node configurations
- Plugin integrations

---

## Phase 6: Chat Interface (Day 7-10)

### 6.1 Copy Chat Components

**Copy:**
```
web/app/components/base/chat/ → frontend/components/chat/
```

**Key files:**
- `chat/` - Main chat container
- `message.tsx` - Message component
- `chat-input.tsx` - Input component

**Adapt:**
- Keep streaming logic
- Keep message rendering
- Remove features you don't need

### 6.2 Copy Chat Page

**Copy:**
```
web/app/(shareLayout)/chat/ → frontend/app/(dashboard)/app/[appId]/chat/
```

Or create embedded chat in app detail page.

**Test:**
- Send messages
- Receive streaming responses
- Message history works
- Error handling works

---

## Phase 7: Datasets (Day 10-12)

### 7.1 Copy Datasets Page

**Copy:**
```
web/app/(commonLayout)/datasets/ → frontend/app/(dashboard)/datasets/
```

**Adapt:**
- Dataset list
- Create dataset
- Upload documents
- View dataset details

### 7.2 Copy Dataset Components

**Copy:**
```
web/app/components/datasets/ → frontend/components/datasets/
```

**Test:**
- Create dataset
- Upload files
- View documents
- Delete dataset

---

## Phase 8: Polish & Deploy (Day 12-14)

### 8.1 Branding

- Replace all Dify logos with yours
- Update colors in Tailwind config
- Update page titles and metadata
- Add your own footer

### 8.2 Remove Unused Code

- Delete features you don't need
- Remove unused components
- Clean up imports

### 8.3 Testing

- Test all user flows
- Fix bugs
- Add error boundaries

### 8.4 Deploy

**Build:**
```bash
pnpm build
```

**Deploy options:**
- Vercel (easiest for Next.js)
- Docker
- Your own server

---

## Quick Reference: What to Copy vs. Build

### ✅ Safe to Copy Directly
- Service layer (`service/`)
- Type definitions (`types/`, `models/`)
- Utility functions (`utils/`)
- UI components (after removing branding)
- Page layouts (after removing branding)

### ⚠️ Copy & Adapt
- Pages (remove branding)
- Navigation (update links)
- Forms (update styling)
- API calls (verify endpoints)

### ❌ Don't Copy
- Dify logo files
- Copyright notices
- Links to Dify docs
- Dify-specific features you don't need

---

## File Copying Checklist

### Day 1: Foundation
- [ ] Create Next.js project
- [ ] Install dependencies
- [ ] Copy config files
- [ ] Copy service layer
- [ ] Copy type definitions
- [ ] Test API connection

### Day 2-3: Auth
- [ ] Copy signin page
- [ ] Remove Dify branding
- [ ] Test login
- [ ] Copy auth context
- [ ] Test protected routes

### Day 3-4: Layout
- [ ] Copy main layout
- [ ] Copy sidebar
- [ ] Copy header
- [ ] Remove branding
- [ ] Test navigation

### Day 4-5: Apps
- [ ] Copy apps list page
- [ ] Copy app components
- [ ] Test CRUD operations

### Day 5-7: App Config
- [ ] Copy app detail page
- [ ] Copy configuration components
- [ ] Test model selection
- [ ] Test prompt editing

### Day 7-10: Chat
- [ ] Copy chat components
- [ ] Test messaging
- [ ] Test streaming
- [ ] Test error handling

### Day 10-12: Datasets
- [ ] Copy datasets page
- [ ] Copy dataset components
- [ ] Test file upload
- [ ] Test document management

### Day 12-14: Polish
- [ ] Replace all branding
- [ ] Clean up code
- [ ] Test everything
- [ ] Deploy

---

## Pro Tips for Speed

1. **Copy entire directories first**, then adapt
2. **Don't rewrite working code** - just remove branding
3. **Test frequently** - make sure each piece works before moving on
4. **Use git** - commit after each working phase
5. **Skip features you don't need** - you can add them later
6. **Keep Dify's folder structure** - easier to reference
7. **Use their components** - they're already styled and working

---

## Common Gotchas

1. **API URLs** - Make sure environment variables are correct
2. **CSRF tokens** - Copy their cookie handling
3. **Auth tokens** - Use same storage mechanism
4. **Streaming responses** - Copy their SSE handling exactly
5. **File uploads** - Copy their upload logic
6. **Error handling** - Keep their error boundaries

---

## When You Get Stuck

1. **Find the equivalent file in Dify's codebase**
2. **Copy it**
3. **Remove branding**
4. **Test it**
5. **Move on**

Don't overthink it - the goal is speed, not perfection. You can refactor later.


---

## Appendix: Essential Dify Files to Copy

### Priority 1: Core Infrastructure (Day 1)

```bash
# Service layer (API client)
web/service/base.ts → frontend/service/base.ts
web/service/common.ts → frontend/service/common.ts
web/service/fetch.ts → frontend/service/fetch.ts

# Configuration
web/config/index.ts → frontend/config/index.ts

# Types
web/types/ → frontend/types/
web/models/ → frontend/types/

# Utilities
web/utils/ → frontend/lib/

# Tailwind config
web/tailwind.config.js → frontend/tailwind.config.ts
web/postcss.config.js → frontend/postcss.config.js
```

### Priority 2: Authentication (Day 2-3)

```bash
# Login page
web/app/signin/ → frontend/app/signin/

# Root layout
web/app/layout.tsx → frontend/app/layout.tsx

# Auth context (if exists)
web/context/ → frontend/context/
```

### Priority 3: Main Layout (Day 3-4)

```bash
# Dashboard layout
web/app/(commonLayout)/ → frontend/app/(dashboard)/

# Sidebar
web/app/components/app-sidebar/ → frontend/components/app-sidebar/

# Header
web/app/components/header/ → frontend/components/header/

# Base components
web/app/components/base/ → frontend/components/base/
```

### Priority 4: Apps Feature (Day 4-7)

```bash
# Apps pages
web/app/(commonLayout)/apps/ → frontend/app/(dashboard)/apps/
web/app/(commonLayout)/app/[appId]/ → frontend/app/(dashboard)/app/[appId]/

# App components
web/app/components/apps/ → frontend/components/apps/
web/app/components/app/ → frontend/components/app/

# App service
web/service/apps.ts → frontend/service/apps.ts
```

### Priority 5: Chat Interface (Day 7-10)

```bash
# Chat components
web/app/components/base/chat/ → frontend/components/chat/

# Chat pages (if separate)
web/app/(shareLayout)/chat/ → frontend/app/(dashboard)/chat/
```

### Priority 6: Datasets (Day 10-12)

```bash
# Datasets pages
web/app/(commonLayout)/datasets/ → frontend/app/(dashboard)/datasets/

# Dataset components
web/app/components/datasets/ → frontend/components/datasets/

# Dataset service
web/service/datasets.ts → frontend/service/datasets.ts
```

---

## Quick Command Reference

### Development
```bash
# Start dev server
cd frontend
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build

# Start production
pnpm start
```

### Copying Files
```bash
# Copy entire directory
cp -r web/app/signin frontend/app/signin

# Copy single file
cp web/service/base.ts frontend/service/base.ts

# Copy with structure
mkdir -p frontend/service
cp web/service/*.ts frontend/service/
```

### Finding Dify Code
```bash
# Find where a component is used
cd web
grep -r "ComponentName" app/

# Find API endpoint usage
grep -r "POST /console/api" service/

# Find type definitions
grep -r "interface AppDetail" types/ models/
```

---

## Troubleshooting

### "Module not found" errors
- Check if you copied all dependencies from `web/package.json`
- Run `pnpm install`

### API calls failing
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check Dify backend is running on port 5001
- Check CORS settings in backend

### Styling looks broken
- Copy `web/tailwind.config.js` exactly
- Copy `web/app/styles/globals.css`
- Check Tailwind is configured in `next.config.js`

### TypeScript errors
- Copy `web/tsconfig.json` settings
- Install missing `@types/*` packages
- Check path aliases match

### Auth not working
- Check cookie handling in `service/base.ts`
- Check CSRF token logic
- Check token storage (localStorage vs cookies)

---

## Success Metrics

### Week 1 Complete
- ✅ Can login with email/password
- ✅ See dashboard with sidebar
- ✅ Navigate between pages

### Week 2 Complete
- ✅ Can create/view/edit apps
- ✅ Can chat with an app
- ✅ Streaming responses work

### Week 3 Complete (Optional)
- ✅ Can create/manage datasets
- ✅ Can upload documents
- ✅ All branding replaced

---

## Next Steps After MVP

1. **Add missing features** - Workflows, tools, plugins
2. **Improve UI/UX** - Better styling, animations
3. **Add tests** - Unit tests, E2E tests
4. **Optimize performance** - Code splitting, lazy loading
5. **Add analytics** - Track usage, errors
6. **Set up CI/CD** - Automated deployment
7. **Add documentation** - User guides, API docs

---

## Resources

- **Dify Docs:** https://docs.dify.ai
- **Next.js Docs:** https://nextjs.org/docs
- **React Query Docs:** https://tanstack.com/query/latest
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Headless UI Docs:** https://headlessui.com

---

## Final Tips

1. **Commit often** - After each working feature
2. **Test in production mode** - `pnpm build && pnpm start`
3. **Keep Dify updated** - Pull latest changes to reference
4. **Document changes** - Note what you modified
5. **Ask for help** - Dify has an active community

**Remember:** The goal is speed, not perfection. Ship the MVP, then iterate.
