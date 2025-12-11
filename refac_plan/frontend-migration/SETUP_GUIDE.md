# Custom Dify Frontend - Setup Guide

## Overview

This is a custom frontend for the Dify backend API, built to comply with Dify's licensing requirements. The original Dify frontend (`/web`) cannot be used without keeping their branding, so we're building our own by **copying and adapting** their code.

**Strategy:** Use Next.js 15 (same as Dify) to directly reference and adapt their implementation for maximum speed.

## Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router (same as Dify)
- **React 19** - UI library (same as Dify)
- **TypeScript** - Type safety for API integration

### UI & Styling
- **Tailwind CSS** - Utility-first CSS (same as Dify)
- **Headless UI** - Unstyled accessible components (same as Dify)
- **@heroicons/react** - Icon library (same as Dify)
- **tailwind-merge** - Merge Tailwind classes intelligently
- **classnames** - Conditional class names

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state, caching, mutations (same as Dify)
- **Zustand** - Client state management (same as Dify)
- **Zod** - Runtime validation and type inference (same as Dify)

### Forms & Validation
- **React Hook Form** - Form state management (same as Dify)
- **@hookform/resolvers** - Zod integration (same as Dify)

### API Client
- **ky** - Modern HTTP client (same as Dify)
  - Built on fetch API
  - Automatic retries, timeout handling

### Utilities
- **ahooks** - React hooks library (same as Dify)
- **dayjs** - Date utilities (same as Dify)
- **lodash-es** - Utility functions (same as Dify)
- **js-cookie** - Cookie handling (same as Dify)

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Jest** - Testing (optional, same as Dify)

## Project Structure

**Strategy:** Mirror Dify's structure for easy reference, then customize as needed.

```
frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth layout group
│   │   ├── signin/           # Login page (copy from web/app/signin)
│   │   └── signup/           # Signup page (copy from web/app/signup)
│   │
│   ├── (dashboard)/          # Main app layout group
│   │   ├── apps/            # Apps management (copy from web/app/(commonLayout)/apps)
│   │   ├── datasets/        # Datasets (copy from web/app/(commonLayout)/datasets)
│   │   ├── tools/           # Tools (copy from web/app/(commonLayout)/tools)
│   │   └── layout.tsx       # Dashboard layout with sidebar
│   │
│   ├── layout.tsx           # Root layout (copy from web/app/layout.tsx)
│   └── page.tsx             # Home/dashboard page
│
├── components/              # Reusable components (copy from web/app/components)
│   ├── base/               # Base UI components
│   ├── header/             # Header components
│   ├── app-sidebar/        # Sidebar navigation
│   └── apps/               # App-specific components
│
├── service/                # API client (copy from web/service)
│   ├── base.ts            # HTTP client, auth, streaming
│   ├── common.ts          # Common API endpoints
│   └── apps.ts            # App-specific endpoints
│
├── context/                # React contexts (copy from web/context)
│   └── auth-context.tsx   # Authentication context
│
├── lib/                    # Utilities (copy from web/utils)
│   └── utils.ts           # Helper functions
│
├── types/                  # TypeScript types (copy from web/types & web/models)
│   ├── app.ts
│   └── common.ts
│
├── config/                 # Configuration (copy from web/config)
│   └── index.ts           # API URLs, constants
│
├── public/                 # Static assets
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration (copy from web)
├── tsconfig.json          # TypeScript configuration (copy from web)
└── package.json           # Dependencies
```

## Getting Started

### Prerequisites
- Node.js >= 22.11.0 (same as Dify)
- pnpm (same as Dify)

### Quick Start

```bash
# 1. Create Next.js project
pnpm create next-app@latest frontend --typescript --tailwind --app --no-src-dir

cd frontend

# 2. Install Dify's dependencies
pnpm add @headlessui/react @heroicons/react tailwind-merge classnames
pnpm add @tanstack/react-query @tanstack/react-query-devtools zustand
pnpm add react-hook-form @hookform/resolvers zod
pnpm add ky js-cookie ahooks dayjs lodash-es

# 3. Install dev dependencies
pnpm add -D @types/js-cookie @types/lodash-es

# 4. Copy config files from Dify
# Copy web/tailwind.config.js → frontend/tailwind.config.ts
# Copy web/tsconfig.json → frontend/tsconfig.json
# Copy web/postcss.config.js → frontend/postcss.config.js

# 5. Start development
pnpm dev
```

### Environment Variables

Create `.env.local`:

```env
# Dify API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5001

# App Configuration
NEXT_PUBLIC_APP_NAME=MyDify
NEXT_PUBLIC_EDITION=SELF_HOSTED

# Optional: Enable dev tools
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

### Development

```bash
# Start dev server
pnpm dev
# Visit http://localhost:3000

# Lint and fix
pnpm lint
# or with auto-fix
pnpm lint -- --fix

# Type check
pnpm type-check

# Build for production
pnpm build

# Start production server
pnpm start
```

## Copy-Adapt Strategy

Since you're using the same stack as Dify, you can **copy their code directly** and adapt it:

### What to Copy

1. **Service Layer** (`web/service/`) → `frontend/service/`
   - Copy exactly - handles auth, streaming, errors
   - Update API URLs in config

2. **Type Definitions** (`web/types/`, `web/models/`) → `frontend/types/`
   - Copy exactly - just TypeScript interfaces

3. **Components** (`web/app/components/`) → `frontend/components/`
   - Copy structure
   - Remove Dify branding (logos, links)
   - Keep functionality

4. **Pages** (`web/app/`) → `frontend/app/`
   - Copy structure
   - Remove Dify branding
   - Update metadata (titles, descriptions)

5. **Utilities** (`web/utils/`) → `frontend/lib/`
   - Copy exactly - helper functions

### What to Adapt

1. **Branding**
   - Replace logos: Search for `logo` in copied files
   - Update app name: Replace "Dify" with your name
   - Update colors: Modify `tailwind.config.ts`

2. **Navigation**
   - Remove features you don't need
   - Update sidebar menu items
   - Update header links

3. **Metadata**
   - Update page titles
   - Update descriptions
   - Update favicons

### Example: Copying Login Page

```bash
# 1. Copy the entire signin directory
cp -r web/app/signin frontend/app/signin

# 2. Open and adapt
# - Remove Dify logo
# - Update page title
# - Keep all functionality

# 3. Test
pnpm dev
# Visit http://localhost:3000/signin
```

**Key Point:** You're not stealing code - you're using the same open-source stack and removing their branding per the license.

## Key Differences from Dify's Frontend

| Aspect | Dify Frontend | Your Frontend |
|--------|---------------|---------------|
| Framework | Next.js 15 (App Router) | Vite + React Router |
| UI Library | Headless UI (custom styled) | shadcn/ui (Radix-based) |
| State | SWR + Zustand | React Query + Zustand |
| HTTP Client | ky | ky (same) |
| Styling | Tailwind CSS | Tailwind CSS (same) |
| Forms | React Hook Form | React Hook Form (same) |

## API Integration Guide

### Setting up the API Client

```typescript
// src/api/client.ts
import ky from 'ky'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        // Add auth token
        const token = localStorage.getItem('auth_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle 401 - redirect to login
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
      },
    ],
  },
})
```

### Example: Authentication

```typescript
// src/api/auth.ts
import { apiClient } from './client'
import { z } from 'zod'

// Define schemas
const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  account: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>

// API function
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('console/api/login', {
    json: data,
  }).json()
  
  return LoginResponseSchema.parse(response)
}
```

### Example: Using React Query

```typescript
// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store token
      localStorage.setItem('auth_token', data.access_token)
      
      // Update auth store
      setAuth({
        token: data.access_token,
        user: data.account,
      })
    },
  })
}
```

## Component Development with shadcn/ui

### Adding Components

```bash
# Add individual components as needed
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add toast
```

### Example: Login Form

```typescript
// src/features/auth/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useLogin } from './hooks/useLogin'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { mutate: login, isPending } = useLogin()
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Form>
  )
}
```

## Testing Strategy

### Unit Tests (Vitest + Testing Library)

```typescript
// src/features/auth/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('validates email format', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await userEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })
})
```

### API Mocking (MSW)

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/v1/console/api/login', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      account: {
        id: '1',
        email: body.email,
        name: 'Test User',
      },
    })
  }),
]
```

## Deployment

### Build for Production

```bash
pnpm build
```

Output will be in `dist/` directory.

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://api.yourdomain.com/v1
```

## Next Steps

1. **Set up the project** - Follow installation steps above
2. **Implement authentication** - Start with login/signup (reference Dify's `/web/app/signin`)
3. **Build core features incrementally**:
   - User dashboard
   - Workflow builder
   - Dataset management
   - App configuration
4. **Add tests** - Write tests as you build features
5. **Deploy** - Set up CI/CD pipeline

## Resources

- [Dify API Documentation](https://docs.dify.ai/api-reference)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

## License Compliance

This frontend is built from scratch and does not include any code from Dify's `/web` directory. It only consumes the Dify backend API, which is permitted under their Apache 2.0 license with modifications.

**Key points:**
- ✅ Using Dify backend API
- ✅ Referencing their code for learning
- ✅ Building your own implementation
- ❌ Not copying their frontend code
- ❌ Not distributing their frontend
- ❌ Not using their branding

---

**Questions or issues?** Reference the original Dify frontend code in `/web` to understand patterns, then implement your own version.
