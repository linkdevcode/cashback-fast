# Coding Conventions & Standards

## Table of Contents
1. [General Principles](#general-principles)
2. [Project Structure](#project-structure)
3. [Naming Conventions](#naming-conventions)
4. [TypeScript Guidelines](#typescript-guidelines)
5. [React/Next.js Patterns](#reactnextjs-patterns)
6. [Styling Guidelines](#styling-guidelines)
7. [API Development](#api-development)
8. [Database Guidelines](#database-guidelines)
9. [Git Workflow](#git-workflow)
10. [Testing Standards](#testing-standards)

---

## General Principles

### 1.1 Code Philosophy
- **KISS (Keep It Simple, Stupid)**: Ưu tiên giải pháp đơn giản, dễ hiểu
- **DRY (Don't Repeat Yourself)**: Tránh duplicate code, tạo reusable components/utilities
- **YAGNI (You Ain't Gonna Need It)**: Không làm features chưa cần thiết
- **Clean Code**: Code phải tự giải thích qua tên biến/hàm, comment khi logic phức tạp

### 1.2 Performance First
- Server Components by default (Next.js App Router)
- Minimize client-side JavaScript
- Optimize images và fonts
- Use streaming và Suspense boundaries

### 1.3 Accessibility
- Semantic HTML
- ARIA labels khi cần thiết
- Keyboard navigation support
- WCAG 2.1 AA compliance

---

## Project Structure

```
cashback-fast/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route groups
│   │   ├── login/
│   │   └── callback/
│   ├── (marketing)/              # Public pages
│   │   └── page.tsx              # Landing page
│   ├── (app)/                    # Authenticated app
│   │   ├── dashboard/
│   │   ├── links/
│   │   ├── orders/
│   │   ├── withdrawals/
│   │   ├── referrals/
│   │   ├── claims/
│   │   └── settings/
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API Routes
│   │   ├── v1/
│   │   │   ├── auth/
│   │   │   ├── links/
│   │   │   ├── orders/
│   │   │   ├── earnings/
│   │   │   ├── withdrawals/
│   │   │   ├── referrals/
│   │   │   ├── claims/
│   │   │   └── admin/
│   │   └── webhooks/
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── error.tsx                 # Error boundary
├── components/                   # React Components
│   ├── ui/                       # Base UI components (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── features/                 # Feature-specific components
│   │   ├── link-generator/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   └── withdrawals/
│   └── providers/                # Context providers
│       ├── auth-provider.tsx
│       ├── theme-provider.tsx
│       └── query-provider.tsx
├── lib/                          # Utilities & Configuration
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Tailwind merge
│   │   ├── format.ts             # Formatting (currency, date)
│   │   ├── validate.ts           # Validation helpers
│   │   └── api.ts                # API helpers
│   ├── db/                       # Database (Supabase)
│   │   ├── index.ts              # Client setup
│   │   ├── schema.ts             # Type definitions
│   │   └── queries/              # Query builders
│   ├── config/                   # Configuration
│   │   ├── site.ts               # Site metadata
│   │   ├── navigation.ts         # Nav items
│   │   └── constants.ts          # App constants
│   └── actions/                  # Server Actions (Next.js)
│       ├── auth.ts
│       ├── links.ts
│       └── orders.ts
├── hooks/                        # Custom React Hooks
│   ├── use-auth.ts
│   ├── use-user.ts
│   ├── use-links.ts
│   └── use-media-query.ts
├── types/                        # TypeScript Types
│   ├── index.ts                  # Re-exports
│   ├── auth.ts
│   ├── link.ts
│   ├── order.ts
│   └── api.ts
├── public/                       # Static Assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── docs/                         # Documentation
│   ├── SPEC.md
│   ├── CONVENTIONS.md
│   └── ARCHITECTURE.md
├── scripts/                      # Utility Scripts
│   └── seed.ts
├── tests/                        # Test Files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── middleware.ts                 # Next.js Middleware
├── next.config.js                # Next.js Config
├── tailwind.config.ts            # Tailwind Config
├── tsconfig.json                 # TypeScript Config
├── package.json                  # Dependencies
└── README.md                     # Project Overview
```

---

## Naming Conventions

### 3.1 Files & Folders
- **Folders**: `kebab-case` (e.g., `link-generator`, `api-routes`)
- **Components**: `PascalCase` (e.g., `LinkCard.tsx`, `UserAvatar.tsx`)
- **Utilities/Hooks**: `camelCase` (e.g., `useAuth.ts`, `formatDate.ts`)
- **Constants**: `SCREAMING_SNAKE_CASE` trong file (e.g., `MAX_LINKS_PER_USER`)
- **Database**: `snake_case` (e.g., `user_id`, `created_at`)

### 3.2 Variables & Functions
```typescript
// ✅ Good
const userName = 'John';
const isLoading = false;
const MAX_RETRY_COUNT = 3;

function getUserById(userId: string): Promise<User> { }
async function createAffiliateLink(url: string): Promise<Link> { }

// ❌ Bad
const user_name = 'John';  // snake_case in JS/TS
const loadingFlag = false; // Hungarian notation
const maxRetry = 3;        // not screaming snake

function get_user() { }    // snake_case
function createLink() { }   // not descriptive
```

### 3.3 React Components
```typescript
// ✅ Component names are PascalCase, descriptive
interface UserCardProps {
  user: User;
  onSelect?: (userId: string) => void;
  isActive?: boolean;
}

export function UserCard({ 
  user, 
  onSelect, 
  isActive = false 
}: UserCardProps) {
  // Component logic
}

// ✅ Hooks are camelCase, start with 'use'
function useAuth() { }
function useLocalStorage<T>(key: string, initialValue: T) { }
```

### 3.4 API Routes
```typescript
// ✅ RESTful naming
// GET    /api/v1/links           - List all links
// POST   /api/v1/links           - Create new link
// GET    /api/v1/links/:id       - Get specific link
// PUT    /api/v1/links/:id       - Update link
// DELETE /api/v1/links/:id       - Delete link
// GET    /api/v1/links/:id/qr    - Get QR code for link

// ❌ Avoid
// /api/getLinks                 - Not RESTful
// /api/links/create             - Not RESTful
// /api/v1/links/delete/:id      - Not RESTful
```

### 3.5 Database
```sql
-- ✅ Table names are snake_case, plural
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ Foreign keys reference table name + _id
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id),
  order_value DECIMAL(12,2) NOT NULL
);

-- ✅ Indexes follow pattern: idx_<table>_<column>
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## TypeScript Guidelines

### 4.1 Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 4.2 Type Definitions
```typescript
// ✅ Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string; // Optional with ?
  createdAt: Date;
}

// ✅ Use type for unions, intersections, or complex types
type OrderStatus = 'pending' | 'approved' | 'rejected';
type ApiResponse<T> = { data: T; error?: string };

// ✅ Use enums for related constants
enum PlatformCode {
  SHOPEE = 'shopee',
  LAZADA = 'lazada',
  TIKTOK = 'tiktok',
  TIKI = 'tiki'
}

// ✅ Generic constraints
function sortByProperty<T extends Record<K, string | number>, K extends keyof T>(
  items: T[],
  property: K
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  });
}
```

### 4.3 Avoid Types
```typescript
// ❌ Avoid 'any'
function processData(data: any) { }

// ✅ Use 'unknown' if type is truly unknown, then narrow
function processData(data: unknown) {
  if (typeof data === 'string') {
    // data is string here
  }
}

// ❌ Avoid 'Function' type
const callback: Function = () => {};

// ✅ Use specific function signature
const callback: () => void = () => {};
const handler: (event: MouseEvent) => void = (e) => {};

// ❌ Don't use 'object' type
const config: object = {};

// ✅ Use Record or interface
const config: Record<string, unknown> = {};
interface Config { port: number; }
```

---

## React/Next.js Patterns

### 5.1 Server vs Client Components
```typescript
// ✅ Server Component (default in App Router)
// - Can be async
// - Can access database directly
// - Cannot use hooks or browser APIs

// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await getCurrentUser(); // Direct DB access
  const stats = await getUserStats(user.id);
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <StatsCards stats={stats} />
      {/* Interactive parts in Client Components */}
      <ClientDashboard userId={user.id} />
    </div>
  );
}

// ✅ Client Component
// - Must have 'use client'
// - Can use hooks, browser APIs
// - Cannot be async

// components/dashboard/client-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLinks } from '@/hooks/use-links';

export function ClientDashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('links');
  const { links, isLoading } = useLinks(userId);
  
  return (
    <div>
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'links' && <LinksList links={links} loading={isLoading} />}
    </div>
  );
}
```

### 5.2 Data Fetching Patterns
```typescript
// ✅ Pattern 1: Server Component with direct DB access
// Best for: Static/dynamic data that doesn't change often

// lib/data/links.ts
import { createClient } from '@/lib/db/server';

export async function getUserLinks(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(`Failed to fetch links: ${error.message}`);
  return data;
}

// ✅ Pattern 2: API Route + Client Component with SWR/React Query
// Best for: Real-time data, user interactions, mutations

// hooks/use-links.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useLinks(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/links?userId=${userId}`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // 30s
    }
  );
  
  return {
    links: data?.links || [],
    isLoading,
    error,
    mutate, // For manual revalidation after mutations
  };
}

// ✅ Pattern 3: Server Action (Next.js 14+)
// Best for: Form submissions, simple mutations

// lib/actions/links.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/db/server';

export async function createAffiliateLink(formData: FormData) {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const url = formData.get('url') as string;
  
  // Validation
  if (!url || !isValidUrl(url)) {
    return { error: 'Invalid URL provided' };
  }
  
  try {
    // Create link
    const { data, error } = await supabase
      .from('affiliate_links')
      .insert({
        user_id: user.id,
        original_url: url,
        // ... other fields
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Revalidate cache
    revalidatePath('/app/links');
    
    return { success: true, link: data };
  } catch (error) {
    return { error: 'Failed to create link' };
  }
}
```

### 5.3 Error Handling
```typescript
// ✅ Pattern: Error Boundary + Toast notifications

// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-500">Something went wrong</h2>
          <p className="mt-2 text-gray-400">Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ Pattern: API Error Handling with consistent response format

// lib/errors/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(resource: string) {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new ApiError(409, message, 'CONFLICT');
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

// lib/api-response.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export function createSuccessResponse<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function createErrorResponse(
  message: string,
  code?: string,
  details?: Record<string, string[]>
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}
```

---

## Styling Guidelines

### 6.1 Tailwind CSS Best Practices

```typescript
// ✅ Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

function Button({ 
  variant = 'primary', 
  size = 'md', 
  className,
  children 
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // Variant styles
        variant === 'primary' && [
          'bg-purple-600 text-white',
          'hover:bg-purple-700',
          'focus:ring-purple-500',
        ],
        variant === 'secondary' && [
          'bg-gray-800 text-gray-100',
          'hover:bg-gray-700',
          'focus:ring-gray-500',
        ],
        variant === 'ghost' && [
          'bg-transparent text-gray-300',
          'hover:bg-white/5',
        ],
        
        // Size styles
        size === 'sm' && 'px-3 py-1.5 text-sm rounded-lg',
        size === 'md' && 'px-4 py-2 text-sm rounded-xl',
        size === 'lg' && 'px-6 py-3 text-base rounded-xl',
        
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Allow className to override
        className
      )}
    >
      {children}
    </button>
  );
}
```

### 6.2 Glassmorphism Pattern (Theo Mockup)

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colors */
    --background: 0 0% 2%; /* #05070F */
    --foreground: 0 0% 96%; /* #F3F4F6 */
    --card: 220 25% 11% / 0.65; /* Glass panel */
    --card-foreground: 0 0% 96%;
    --popover: 220 25% 8%;
    --popover-foreground: 0 0% 96%;
    --primary: 270 91% 65%; /* Purple #A855F7 */
    --primary-foreground: 0 0% 100%;
    --secondary: 220 25% 14%;
    --secondary-foreground: 0 0% 96%;
    --muted: 220 20% 20%;
    --muted-foreground: 215 16% 57%; /* Slate #94A3B8 */
    --accent: 142 71% 45%; /* Green #22C55E */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 22% / 0.4;
    --input: 220 13% 22%;
    --ring: 270 91% 65%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer components {
  /* Glassmorphism Panel */
  .glass-panel {
    @apply bg-card/65 backdrop-blur-xl border border-white/[0.08] rounded-2xl;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
  
  .glass-panel-heavy {
    @apply bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/[0.12];
  }
  
  /* Neon Glow Effects */
  .neon-glow-purple {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.25);
  }
  
  .neon-glow-green {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.25);
  }
  
  /* Gradient Text */
  .gradient-text {
    @apply bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent;
  }
  
  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    @apply w-1.5 h-1.5;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-purple-500/40 rounded-full;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-purple-500/70;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  /* Animation utilities */
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slide-in {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
```

---

## API Development

### 7.1 API Route Structure
```typescript
// app/api/v1/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import { ApiError } from '@/lib/errors';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

// Validation schema
const createLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  platform: z.enum(['shopee', 'lazada', 'tiktok', 'tiki']).optional(),
});

// GET /api/v1/links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw ApiError.unauthorized();
    }
    
    const { data: links, error, count } = await supabase
      .from('affiliate_links')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
      
    if (error) {
      throw ApiError.internal('Failed to fetch links');
    }
    
    return NextResponse.json(
      createSuccessResponse(links, {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > page * limit,
      })
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code),
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// POST /api/v1/links
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = createLinkSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      throw ApiError.badRequest('Validation failed', errors);
    }
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw ApiError.unauthorized();
    }
    
    // Platform detection if not provided
    const platform = result.data.platform || detectPlatform(result.data.url);
    
    // Generate affiliate link via AccessTrade
    const affiliateUrl = await generateAffiliateLink(result.data.url, platform);
    
    // Save to database
    const { data: link, error } = await supabase
      .from('affiliate_links')
      .insert({
        user_id: user.id,
        platform_id: platform,
        original_url: result.data.url,
        affiliate_url: affiliateUrl,
        short_code: generateShortCode(),
      })
      .select()
      .single();
      
    if (error) {
      throw ApiError.internal('Failed to create link');
    }
    
    return NextResponse.json(
      createSuccessResponse(link),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode }
      );
    }
    
    console.error('Unexpected error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
```

### 7.2 Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/db/middleware';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/callback', '/api/webhooks'];
const PUBLIC_API_PATHS = ['/api/v1/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  const isPublicApi = PUBLIC_API_PATHS.some(path => pathname.startsWith(path));
  
  if (isPublicPath || isPublicApi) {
    return NextResponse.next();
  }
  
  // Check authentication
  const supabase = createClient(request);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Add user to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
  
  // Handle page routes
  if (error || !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Config for matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
```

---

## Database Guidelines

### 8.1 Supabase Best Practices
```typescript
// lib/db/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  );
}

// lib/db/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 8.2 Database Queries
```typescript
// lib/db/queries/links.ts
import { createClient } from '@/lib/db/server';
import type { AffiliateLink, CreateLinkInput } from '@/types/link';

export async function getUserLinks(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    platform?: string;
  } = {}
) {
  const { page = 1, limit = 20, platform } = options;
  
  const supabase = createClient();
  
  let query = supabase
    .from('affiliate_links')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (platform) {
    query = query.eq('platform_id', platform);
  }
  
  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1);
    
  if (error) {
    throw new Error(`Failed to fetch links: ${error.message}`);
  }
  
  return {
    links: data as AffiliateLink[],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > page * limit,
  };
}

export async function createLink(
  userId: string,
  input: CreateLinkInput
): Promise<AffiliateLink> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('affiliate_links')
    .insert({
      user_id: userId,
      original_url: input.url,
      platform_id: input.platform,
      short_code: generateShortCode(),
      affiliate_url: input.affiliateUrl,
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create link: ${error.message}`);
  }
  
  return data as AffiliateLink;
}

// Helper functions
function generateShortCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

---

## Git Workflow

### 9.1 Branch Strategy (Git Flow đơn giản)
```
main        ← Production-ready code
│
├── develop   ← Integration branch (optional for small team)
│
├── feature/FEATURE-NAME     ← Feature branches
├── bugfix/BUG-DESCRIPTION   ← Bug fix branches
├── hotfix/ISSUE             ← Production hotfixes
└── refactor/AREA            ← Refactoring branches
```

### 9.2 Commit Convention (Conventional Commits)
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build process, dependencies, etc.

**Examples:**
```bash
# Feature
feat(links): add link generation with QR code

# Bug fix
fix(auth): resolve Google OAuth callback error

# Refactor
refactor(dashboard): extract stats cards to separate component

# Documentation
docs(api): add OpenAPI spec for withdrawals endpoint

# With scope and body
feat(orders): add order filtering by platform

- Add platform selector component
- Implement query param synchronization
- Add loading skeleton

Closes #123
```

### 9.3 Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## How Has This Been Tested?
Describe testing done

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding documentation changes
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass
```

---

## Testing Standards

### 10.1 Testing Pyramid
```
       /\
      /  \      E2E Tests (Playwright)
     /____\        ~10% of tests
    /      \
   /        \   Integration Tests
  /__________\      ~30% of tests
 /            \
/              \ Unit Tests (Vitest)
________________   ~60% of tests
```

### 10.2 Unit Testing (Vitest + React Testing Library)
```typescript
// components/ui/__tests__/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-purple-600');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });
});
```

### 10.3 Integration Testing
```typescript
// tests/integration/links.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { generateAffiliateLink } from '@/lib/actions/links';

const TEST_USER_ID = 'test-user-123';

// Skip in CI if no Supabase URL
const describeIfDb = process.env.SUPABASE_URL ? describe : describe.skip;

describeIfDb('Link Generation Integration', () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  beforeEach(async () => {
    // Clean up test data
    await supabase
      .from('affiliate_links')
      .delete()
      .eq('user_id', TEST_USER_ID);
  });

  afterEach(async () => {
    // Clean up
    await supabase
      .from('affiliate_links')
      .delete()
      .eq('user_id', TEST_USER_ID);
  });

  it('creates a link and stores it in the database', async () => {
    const testUrl = 'https://shopee.vn/product/123';
    
    const result = await generateAffiliateLink({
      url: testUrl,
      userId: TEST_USER_ID,
    });

    expect(result.success).toBe(true);
    expect(result.link).toBeDefined();
    expect(result.link?.original_url).toBe(testUrl);

    // Verify in database
    const { data: dbLink } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq('id', result.link!.id)
      .single();

    expect(dbLink).toBeDefined();
    expect(dbLink?.short_code).toHaveLength(8);
  });

  it('rejects invalid URLs', async () => {
    await expect(
      generateAffiliateLink({
        url: 'not-a-valid-url',
        userId: TEST_USER_ID,
      })
    ).rejects.toThrow('Invalid URL');
  });
});
```

### 10.4 E2E Testing (Playwright)
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign in with Google', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Click Google sign in button
    await page.click('[data-testid="google-signin"]');
    
    // Note: In real tests, we'd mock the OAuth flow
    // or use test credentials in a test environment
  });

  test('authenticated user is redirected from login', async ({ page, context }) => {
    // Set auth cookie to simulate logged in user
    await context.addCookies([{
      name: 'sb-auth-token',
      value: 'test-token',
      domain: 'localhost',
      path: '/',
    }]);
    
    // Try to access login page
    await page.goto('/login');
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL('/app/dashboard');
  });
});

// tests/e2e/links.spec.ts
test.describe('Link Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    // ... login flow
  });

  test('user can generate affiliate link', async ({ page }) => {
    // Navigate to link generator
    await page.goto('/app/links');
    
    // Enter URL
    await page.fill('[data-testid="url-input"]', 'https://shopee.vn/product/123');
    
    // Click generate button
    await page.click('[data-testid="generate-button"]');
    
    // Wait for result
    await page.waitForSelector('[data-testid="link-result"]');
    
    // Verify result
    const shortUrl = await page.textContent('[data-testid="short-url"]');
    expect(shortUrl).toContain('hoantien.pro');
  });
});
```

---

This concludes the Coding Conventions document. These standards ensure code quality, maintainability, and consistency across the project.

**Key Takeaways:**
1. **Simplicity over complexity** - Prefer simple, readable solutions
2. **Type safety** - Use TypeScript strict mode effectively
3. **Consistent naming** - Follow conventions for files, variables, functions
4. **Server-first** - Use Server Components by default in Next.js
5. **Test coverage** - Write tests at all levels of the pyramid
6. **Accessibility** - Build for all users
7. **Performance** - Optimize images, fonts, and bundle size

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-11  
**Status**: Active
