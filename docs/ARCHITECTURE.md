# System Architecture & Technical Design

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Data Flow](#data-flow)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [Authentication Flow](#authentication-flow)
7. [Rate Limiting Strategy (No Redis)](#rate-limiting-strategy-no-redis)
8. [Webhook Handling](#webhook-handling)
9. [Deployment Architecture](#deployment-architecture)
10. [Monitoring & Observability](#monitoring--observability)

---

## Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Browser   │  │   Mobile    │  │   PWA       │            │
│  │   (Next.js) │  │   (Future)  │  │   (Future)  │            │
│  └──────┬──────┘  └─────────────┘  └─────────────┘            │
└─────────┼───────────────────────────────────────────────────────┘
          │ HTTPS
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Edge Cache    │  │   Rate Limit    │  │   SSL/TLS       │  │
│  │   (Global CDN)  │  │   (Vercel)      │  │   Termination   │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼──────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              NEXT.JS 14 (APP ROUTER)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │   Server    │  │   Client    │  │   API Routes    │    │  │
│  │  │ Components  │  │ Components  │  │   (Edge/Node)   │    │  │
│  │  │  (RSC)      │  │   (RCC)     │  │                 │    │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘    │  │
│  │         │                │                   │            │  │
│  │         └────────────────┴───────────────────┘            │  │
│  │                        │                                   │  │
│  │         ┌─────────────┴─────────────┐                     │  │
│  │         │    Server Actions         │                     │  │
│  │         │  (Form mutations)         │                     │  │
│  │         └───────────────────────────┘                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Supabase      │  │   Supabase      │  │   Supabase      │   │
│  │   PostgreSQL    │  │   Auth          │  │   Storage       │   │
│  │   (Primary DB)  │  │   (OAuth/JWT)   │  │   (Files)       │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │AccessTrade  │  │  Google     │  │  Email      │            │
│  │  (Affiliate)│  │  OAuth      │  │  (Resend)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js 14 App Router** | Server Components by default, nested layouts, streaming, server actions |
| **No Redis (Phase 1)** | Keep 0đ cost, use in-memory rate limiting for MVP (< 500 users) |
| **Supabase** | PostgreSQL + Auth + Storage + Realtime in one platform, generous free tier |
| **Vercel Edge Functions** | Global edge deployment, automatic scaling, generous free tier |
| **Server Actions** | Mutations without separate API routes, progressive enhancement |
| **SWR/React Query** | Client-side caching, automatic revalidation, optimistic updates |

---

## System Components

### 2.1 Component Categories

```
Components
├── ui/                    # Base UI (shadcn/ui style)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── ...
│
├── layout/                # Layout components
│   ├── root-layout.tsx    # App root layout
│   ├── app-layout.tsx     # Authenticated app layout
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── navbar.tsx         # Top navigation
│   ├── footer.tsx         # Page footer
│   └── mobile-nav.tsx     # Mobile bottom nav
│
├── features/              # Feature-specific components
│   ├── auth/
│   │   ├── login-button.tsx
│   │   ├── user-menu.tsx
│   │   └── protected-route.tsx
│   │
│   ├── link-generator/
│   │   ├── url-input.tsx
│   │   ├── platform-selector.tsx
│   │   ├── link-result.tsx
│   │   ├── qr-code.tsx
│   │   └── recent-links.tsx
│   │
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── earnings-chart.tsx
│   │   ├── recent-orders.tsx
│   │   └── platform-breakdown.tsx
│   │
│   ├── orders/
│   │   ├── order-filters.tsx
│   │   ├── order-table.tsx
│   │   ├── order-status-badge.tsx
│   │   └── order-details.tsx
│   │
│   ├── withdrawals/
│   │   ├── balance-card.tsx
│   │   ├── bank-select.tsx
│   │   ├── withdrawal-form.tsx
│   │   └── withdrawal-history.tsx
│   │
│   ├── referrals/
│   │   ├── referral-stats.tsx
│   │   ├── referral-link.tsx
│   │   ├── friends-list.tsx
│   │   └── commission-history.tsx
│   │
│   └── claims/
│       ├── claim-form.tsx
│       ├── claim-status.tsx
│       └── claim-history.tsx
│
└── providers/             # Context providers
    ├── auth-provider.tsx
    ├── theme-provider.tsx
    ├── query-provider.tsx
    └── toast-provider.tsx
```

### 2.2 Component Guidelines

```typescript
// ✅ Good Component Example

// 1. Props interface with clear types
interface UserCardProps {
  user: User;
  showEmail?: boolean;
  onEdit?: (user: User) => void;
  className?: string;
}

// 2. Forward ref for composition
export const UserCard = forwardRef<HTMLDivElement, UserCardProps>(
  ({ user, showEmail = true, onEdit, className }, ref) => {
    // 3. Early return for loading/error states
    if (!user) {
      return <UserCardSkeleton />;
    }

    // 4. Memoize handlers
    const handleEdit = useCallback(() => {
      onEdit?.(user);
    }, [onEdit, user]);

    // 5. Render with semantic HTML and accessibility
    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel p-4 rounded-xl',
          'flex items-center gap-4',
          className
        )}
      >
        <Avatar src={user.avatar} alt={user.name} />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">
            {user.name}
          </h3>
          
          {showEmail && (
            <p className="text-xs text-slate-400 truncate">
              {user.email}
            </p>
          )}
        </div>
        
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            aria-label={`Edit ${user.name}`}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }
);

UserCard.displayName = 'UserCard';

// ❌ Bad Component Example

function userCard(props) {  // No TypeScript types
  var user = props.user;  // var instead of const/let
  
  function handleClick() {  // Not memoized
    console.log(user);
  }
  
  return (  // Inconsistent formatting
    <div className="p-4 bg-gray-800 rounded">  {/* Hardcoded classes */}
      <img src={user.avatar}/>  {/* Missing alt */}
      <div>{user.name}</div>
      <button onClick={handleClick}>Click</button>  {/* No type attribute */}
    </div>
  );
}
```

---

## API Development

### 7.1 Route Handler Pattern

```typescript
// app/api/v1/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/db/server';
import { ApiError } from '@/lib/errors';
import { 
  createSuccessResponse, 
  createErrorResponse 
} from '@/lib/api-response';

// GET handler
export async function GET(request: NextRequest) {
  try {
    // 1. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const platform = searchParams.get('platform');

    // 2. Authenticate
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw ApiError.unauthorized();
    }

    // 3. Build query
    let query = supabase
      .from('affiliate_links')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (platform) {
      query = query.eq('platform_id', platform);
    }

    // 4. Execute query
    const { data: links, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw ApiError.internal('Failed to fetch links');
    }

    // 5. Return response
    return NextResponse.json(
      createSuccessResponse(links, {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > page * limit,
      })
    );

  } catch (error) {
    // 6. Error handling
    if (error instanceof ApiError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code),
        { status: error.statusCode }
      );
    }

    console.error('Unexpected error in GET /api/v1/links:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate body
    const body = await request.json();
    
    const schema = z.object({
      url: z.string().url('Invalid URL format'),
      platform: z.enum(['shopee', 'lazada', 'tiktok', 'tiki']).optional(),
    });

    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      throw ApiError.badRequest('Validation failed', errors);
    }

    // 2. Authenticate
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw ApiError.unauthorized();
    }

    // 3. Business logic
    const { url, platform: providedPlatform } = result.data;
    
    // Auto-detect platform if not provided
    const platform = providedPlatform || detectPlatform(url);
    
    if (!platform) {
      throw ApiError.badRequest('Could not detect platform from URL');
    }

    // Generate affiliate link (via AccessTrade API)
    const affiliateUrl = await generateAffiliateLink(url, platform);
    
    // 4. Save to database
    const { data: link, error: dbError } = await supabase
      .from('affiliate_links')
      .insert({
        user_id: user.id,
        original_url: url,
        platform_id: platform,
        affiliate_url: affiliateUrl,
        short_code: generateShortCode(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw ApiError.internal('Failed to save link');
    }

    // 5. Return response
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

    console.error('Unexpected error in POST /api/v1/links:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Helper functions
function detectPlatform(url: string): string | null {
  const platforms: Record<string, RegExp> = {
    shopee: /shopee\.vn|shopee\.co\.id/,
    lazada: /lazada\.vn|lazada\.co\.th/,
    tiktok: /tiktok\.com\/shop/,
    tiki: /tiki\.vn/,
  };
  
  for (const [platform, regex] of Object.entries(platforms)) {
    if (regex.test(url)) {
      return platform;
    }
  }
  
  return null;
}

function generateShortCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateAffiliateLink(originalUrl: string, platform: string): Promise<string> {
  // TODO: Implement AccessTrade API integration
  // For now, return a mock URL
  return `https://accesstrade.vn/track?url=${encodeURIComponent(originalUrl)}&platform=${platform}`;
}
```

### 7.2 Error Handling Middleware

```typescript
// lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/errors';

export type Handler = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
            },
          },
          { status: error.statusCode }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        },
        { status: 500 }
      );
    }
  };
}

// Usage
// app/api/v1/example/route.ts
import { withErrorHandler } from '@/lib/api/middleware';

export const GET = withErrorHandler(async (req) => {
  // Your handler code here
  // Any errors will be caught and formatted automatically
});
```

---

## Rate Limiting Strategy (No Redis)

### 8.1 In-Memory Rate Limiting (MVP Only)

For MVP with single instance deployment, use in-memory rate limiting:

```typescript
// lib/rate-limit/memory-store.ts
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class MemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupMs = 60000) {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime <= now) {
          this.store.delete(key);
        }
      }
    }, cleanupMs);
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetTime <= now) {
      // New window
      const entry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.store.set(key, entry);
      return { count: 1, resetTime: entry.resetTime };
    }

    // Increment existing
    existing.count++;
    return { count: existing.count, resetTime: existing.resetTime };
  }

  getRemaining(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetTime <= now) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - existing.count);
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance for server
export const rateLimitStore = new MemoryRateLimitStore();

// Cleanup on process exit
process.on('beforeExit', () => {
  rateLimitStore.destroy();
});
```

```typescript
// lib/rate-limit/index.ts
import { rateLimitStore } from './memory-store';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export function rateLimit(
  req: Request,
  options: RateLimitOptions
): RateLimitResult {
  const { maxRequests, windowMs, keyGenerator } = options;

  // Generate key based on IP + user agent (or custom generator)
  const key = keyGenerator 
    ? keyGenerator(req) 
    : generateDefaultKey(req);

  // Increment counter
  const { count, resetTime } = rateLimitStore.increment(key, windowMs);

  // Calculate remaining
  const remaining = Math.max(0, maxRequests - count);
  const allowed = count <= maxRequests;

  // Calculate retry after if rate limited
  const retryAfter = !allowed 
    ? Math.ceil((resetTime - Date.now()) / 1000) 
    : undefined;

  return {
    allowed,
    limit: maxRequests,
    remaining,
    resetTime,
    retryAfter,
  };
}

function generateDefaultKey(req: Request): string {
  // Get IP from headers (Vercel-specific)
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  
  // Get user agent
  const userAgent = req.headers.get('user-agent') || '';
  
  // Create hash
  return `rate_limit:${ip}:${userAgent.slice(0, 50)}`;
}

// Pre-configured rate limiters
export const rateLimiters = {
  // Strict: 5 requests per minute (for auth, withdrawals)
  strict: (req: Request) => rateLimit(req, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  }),
  
  // Standard: 30 requests per minute (for general API)
  standard: (req: Request) => rateLimit(req, {
    maxRequests: 30,
    windowMs: 60 * 1000,
  }),
  
  // Generous: 100 requests per minute (for public endpoints)
  generous: (req: Request) => rateLimit(req, {
    maxRequests: 100,
    windowMs: 60 * 1000,
  }),
};
```

---

## Deployment Architecture

### 9.1 Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/go/:code",
      "destination": "/api/redirect/:code"
    }
  ],
  "crons": [
    {
      "path": "/api/cron/sync-orders",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/cron/process-withdrawals",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 9.2 Environment Configuration

```bash
# .env.local (Development)
# ==============================================
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# AccessTrade (Optional for MVP)
ACCESSTRADE_API_KEY=your_accesstrade_key
ACCESSTRADE_SECRET=your_accesstrade_secret

# Email (Optional for MVP)
RESEND_API_KEY=your_resend_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REFERRALS=false
NEXT_PUBLIC_ENABLE_CLAIMS=true
```

---

## Monitoring & Observability

### 10.1 Vercel Analytics

Vercel Analytics được tích hợp sẵn, không cần cấu hình thêm.

### 10.2 Error Tracking (Sentry - Optional)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}
```

### 10.3 Custom Logging

```typescript
// lib/logger.ts

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = process.env.NODE_ENV === 'production' 
      ? LogLevel.WARN 
      : LogLevel.DEBUG;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      ...meta,
    };

    if (level >= LogLevel.ERROR) {
      console.error(JSON.stringify(logEntry));
    } else if (level >= LogLevel.WARN) {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.WARN, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...meta,
    });
  }
}

export const logger = new Logger();

// Usage
logger.info('User created affiliate link', { 
  userId: '123', 
  platform: 'shopee' 
});

logger.error('Failed to create link', error, { userId: '123' });
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-11  
**Status**: Draft
