# HOÀN TIỀN PRO - TECHNICAL SPECIFICATION

## 1. OVERVIEW & PROJECT GOALS

### 1.1 Product Vision

Nền tảng cashback hoàn tiền cho người dùng khi mua sắm qua các link affiliate được tạo từ hệ thống. Hệ thống tự động chia sẻ hoa hồng affiliate giữa platform và người dùng theo tỷ lệ cấu hình.

### 1.2 Target Users

- **End Users**: Người tiêu dùng muốn nhận cashback khi mua sắm online
- **Admin**: Quản trị viên quản lý hệ thống, tỷ lệ hoa hồng, users

### 1.3 Success Metrics

- Thời gian tạo link < 2 giây
- Thời gian đối soát đơn hàng < 10 phút (API polling)
- Uptime > 99.5%

***

## 2. TECH STACK

### 2.1 Core Technology

| Layer                | Technology                          | Version | Rationale                                     |
| -------------------- | ----------------------------------- | ------- | --------------------------------------------- |
| **Frontend**         | Next.js 14 (App Router)             | ^14.x   | SSR/SSG, API Routes, Vercel optimized         |
| **Styling**          | Tailwind CSS + Headless UI          | ^3.x    | Rapid UI development, dark mode ready         |
| **State Management** | Zustand + React Query (TanStack)    | ^4.x    | Server state caching, client state management |
| **Backend**          | Next.js API Routes + Edge Functions | -       | Unified codebase, serverless deployment       |
| **Database**         | Supabase (PostgreSQL)               | -       | Realtime subscriptions, Auth, Storage         |
| **Authentication**   | Supabase Auth                       | -       | Secure, social login ready                    |
| **Cache**            | Upstash Redis                       | -       | Rate limiting, session caching                |
| **Queue**            | Inngest / BullMQ (Redis)            | -       | Async job processing (webhook handling)       |

### 2.2 External Integrations

| Service              | Purpose                                  | API Docs                                      |
| -------------------- | ---------------------------------------- | --------------------------------------------- |
| **AccessTrade**      | Affiliate tracking, commission reporting | [AccessTrade API](https://api.accesstrade.vn) |
| **Shopee Affiliate** | Link generation, conversion tracking     | Shopee Open Platform                          |
| **Lazada Affiliate** | Link generation, conversion tracking     | Lazada Affiliate API                          |
| **TikTok Shop**      | Creator/Affiliate integration            | TikTok Shop Partner API                       |
| **Tiki Affiliate**   | Link generation, reporting               | Tiki Affiliate API                            |
| **Google OAuth**     | User authentication                      | Google Identity                               |
| **VietQR / Napas**   | Bank transfer processing                 | Napas API (optional)                          |

### 2.3 Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel Edge   │────▶│  Next.js App    │────▶│   Supabase      │
│   (CDN/Edge)    │     │  (Serverless)   │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Upstash Redis  │     │   Inngest       │     │  External APIs  │
│  (Cache/Queue)  │     │  (Job Queue)    │     │ (AccessTrade...)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

***

## 3. FEATURE REQUIREMENTS (Prioritized)

### Phase 1: MVP Core (P0 - Must Have)

#### 3.1.1 Authentication System

- **F1.1**: Đăng nhập bằng Google OAuth (Supabase Auth)
- **F1.2**: Lưu trữ thông tin user cơ bản (name, email, avatar, phone)
- **F1.3**: Session management với JWT refresh tokens
- **F1.4**: Protected routes middleware

#### 3.1.2 Affiliate Link Generation

- **F2.1**: Input URL từ các platform (Shopee, Lazada, TikTok Shop, Tiki)
- **F2.2**: Auto-detect platform từ URL pattern
- **F2.3**: Chuyển đổi sang link affiliate qua AccessTrade API
- **F2.4**: Generate short URL có tracking parameter (user\_id, timestamp)
- **F2.5**: Generate QR Code cho link
- **F2.6**: Lưu history các link đã tạo (last 50 links)

#### 3.1.3 Order Tracking (Lịch sử đơn hàng)

- **F3.1**: Webhook receiver từ AccessTrade để nhận conversion reports
- **F3.2**: Lưu trữ order details (order\_id, platform, order\_value, commission\_amount, status)
- **F3.3**: Order status tracking: Pending → Approved → Rejected
- **F3.4**: Filter/Search orders theo platform, status, date range
- **F3.5**: Pagination (20 items/page)

#### 3.1.4 Earnings Overview (Tổng quan thu nhập)

- **F4.1**: Dashboard hiển thị 3 số chính:
  - Số dư khả dụng (Available)
  - Số dư chờ duyệt (Pending)
  - Tổng đã nhận (Total Earned)
- **F4.2**: Biểu đồ thu nhập theo thời gian (7 ngày, 30 ngày, 90 ngày)
- **F4.3**: Top performing platforms
- **F4.4**: Recent activity feed

#### 3.1.5 Withdrawal System (Rút tiền)

- **F5.1**: Bank account management (CRUD bank accounts)
- **F5.2**: Withdrawal request form (amount, select bank)
- **F5.3**: Validation: min amount 50,000 VND, max = available balance
- **F5.4**: Withdrawal status tracking: Pending → Processing → Completed/Failed
- **F5.5**: Withdrawal history with pagination
- **F5.6**: Email notification khi withdrawal status thay đổi

#### 3.1.6 Missing Order Claims (Khiếu nại sót đơn)

- **F6.1**: Claim form (platform, order\_id, order\_value, screenshot)
- **F6.2**: Claim status tracking
- **F6.3**: Claim history
- **F6.4**: Admin notification khi có claim mới

### Phase 2: Growth Features (P1 - Should Have)

#### 3.2.1 Referral System (Giới thiệu bạn bè)

- **F7.1**: Unique referral link cho mỗi user
- **F7.2**: Referral registration tracking
- **F7.3**: Commission sharing: User nhận % từ hoa hồng của người được giới thiệu (configurable rate)
- **F7.4**: Referral dashboard (số người mời, tổng hoa hồng từ referral)

#### 3.2.2 Admin Dashboard

- **F8.1**: User management (list, ban/unban, view details)
- **F8.2**: Commission rate settings (global default + per-platform)
- **F8.3**: Withdrawal management (approve/reject withdrawals)
- **F8.4**: Order management (view all orders, manual status update)
- **F8.5**: Claims management (review and resolve claims)
- **F8.6**: System settings (min withdrawal, referral rate, etc.)
- **F8.7**: Analytics dashboard (revenue, user growth, platform performance)

#### 3.2.3 Platform Expansion

- **F9.1**: Support thêm các platform khác qua AccessTrade (Sendo, etc.)
- **F9.2**: Multi-currency support (preparation for international expansion)

### Phase 3: Polish & Scale (P2 - Nice to Have)

#### 3.3.1 Advanced Features

- **F10.1**: Real-time notifications (WebSocket/Supabase Realtime)
- **F10.2**: Mobile app (React Native/Expo)
- **F10.3**: Browser extension for quick link conversion
- **F10.4**: Bulk link generation (CSV upload)
- **F10.5**: Affiliate link analytics (click tracking, conversion rates)

#### 3.3.2 Security & Compliance

- **F11.1**: 2FA (Two-Factor Authentication)
- **F11.2**: KYC verification for large withdrawals
- **F11.3**: Fraud detection system
- **F11.4**: GDPR compliance tools (data export/deletion)

***

## 4. DATABASE SCHEMA (Supabase PostgreSQL)

### 4.1 Core Tables

```sql
-- Users table (extends Supabase Auth)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  phone text,
  referral_code text unique,
  referred_by uuid references public.users(id),
  is_banned boolean default false,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bank Accounts
create table public.bank_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_name text not null,
  bank_code text not null,
  account_number text not null,
  account_holder text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Platform Configurations
create table public.platforms (
  id uuid default gen_random_uuid() primary key,
  name text not null unique, -- Shopee, Lazada, TikTok Shop, Tiki
  code text not null unique, -- shopee, lazada, tiktok, tiki
  logo_url text,
  base_url text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Commission Rates (can be global or per-platform)
create table public.commission_rates (
  id uuid default gen_random_uuid() primary key,
  platform_id uuid references public.platforms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade, -- NULL = default rate
  user_rate_percent decimal(5,2) not null, -- 80.00 = user gets 80%
  platform_rate_percent decimal(5,2) not null, -- 20.00 = platform keeps 20%
  effective_from timestamp with time zone default timezone('utc'::text, now()) not null,
  effective_to timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_rate_percent check (user_rate_percent + platform_rate_percent = 100)
);

-- Generated Affiliate Links
create table public.affiliate_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  platform_id uuid references public.platforms(id) on delete cascade not null,
  original_url text not null,
  short_code text unique not null, -- for short URL
  affiliate_url text not null, -- full affiliate link from AccessTrade
  qr_code_url text,
  click_count integer default 0,
  conversion_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders / Conversions
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  affiliate_link_id uuid references public.affiliate_links(id) on delete set null,
  platform_id uuid references public.platforms(id) on delete cascade not null,
  order_id_external text not null, -- from AccessTrade
  order_value decimal(12,2) not null,
  commission_total decimal(12,2) not null, -- from AccessTrade
  user_commission decimal(12,2) not null, -- calculated based on rate
  platform_commission decimal(12,2) not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  click_time timestamp with time zone,
  conversion_time timestamp with time zone,
  audit_date timestamp with time zone, -- estimated approval date
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Withdrawals
create table public.withdrawals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_account_id uuid references public.bank_accounts(id) on delete set null,
  amount decimal(12,2) not null,
  fee decimal(12,2) default 0,
  net_amount decimal(12,2) not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'rejected')),
  processed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_withdrawal_amount check (amount > 0)
);

-- Claims (Missing Order Reports)
create table public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  platform_id uuid references public.platforms(id) on delete cascade not null,
  order_id_external text not null,
  order_value decimal(12,2) not null,
  screenshot_url text,
  status text default 'open' check (status in ('open', 'investigating', 'resolved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Referral Commissions
create table public.referral_commissions (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.users(id) on delete cascade not null,
  referred_id uuid references public.users(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  commission_amount decimal(12,2) not null,
  is_paid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- System Settings
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Initial Settings
-- min_withdrawal_amount: 50000
-- default_user_commission_rate: 80 (80% to user, 20% to platform)
-- referral_commission_rate: 5 (5% from referred user's cashback)
-- platform_fees: {}

-- Activity Logs
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for Performance
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at);
create index idx_affiliate_links_user_id on public.affiliate_links(user_id);
create index idx_affiliate_links_short_code on public.affiliate_links(short_code);
create index idx_withdrawals_user_id on public.withdrawals(user_id);
create index idx_withdrawals_status on public.withdrawals(status);
create index idx_referral_commissions_referrer on public.referral_commissions(referrer_id);

-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.orders enable row level security;
alter table public.withdrawals enable row level security;
alter table public.claims enable row level security;
alter table public.referral_commissions enable row level security;
```

***

## 5. API DESIGN OVERVIEW (RESTful + Webhooks)

### 5.1 Authentication APIs

```
POST /api/v1/auth/google          - Google OAuth login
POST /api/v1/auth/logout          - Logout
GET  /api/v1/auth/me              - Get current user
PUT  /api/v1/auth/me              - Update profile
```

### 5.2 Affiliate Link APIs

```
POST /api/v1/links                - Create new affiliate link
GET  /api/v1/links                - List user's links (paginated)
GET  /api/v1/links/:id            - Get link details
GET  /api/v1/links/:id/qr         - Generate QR code
DELETE /api/v1/links/:id          - Delete link
```

### 5.3 Order/Conversion APIs

```
GET  /api/v1/orders               - List user's orders (filter, sort, paginate)
GET  /api/v1/orders/stats         - Order statistics
GET  /api/v1/orders/:id           - Get order details
```

### 5.4 Earnings APIs

```
GET  /api/v1/earnings/dashboard   - Dashboard stats (available, pending, total)
GET  /api/v1/earnings/history     - Earnings history (chart data)
GET  /api/v1/earnings/platforms  - Breakdown by platform
```

### 5.5 Withdrawal APIs

```
POST /api/v1/banks                - Add bank account
GET  /api/v1/banks                - List bank accounts
DELETE /api/v1/banks/:id          - Remove bank account
POST /api/v1/withdrawals          - Create withdrawal request
GET  /api/v1/withdrawals          - List withdrawal history
GET  /api/v1/withdrawals/:id      - Get withdrawal details
```

### 5.6 Referral APIs

```
GET  /api/v1/referrals            - Get referral stats
GET  /api/v1/referrals/link      - Get referral link
GET  /api/v1/referrals/friends   - List referred friends
GET  /api/v1/referrals/commissions - Referral commission history
```

### 5.7 Claims APIs

```
POST /api/v1/claims               - Submit missing order claim
GET  /api/v1/claims               - List user's claims
GET  /api/v1/claims/:id           - Get claim details
```

### 5.8 Admin APIs

```
GET  /api/v1/admin/users          - List all users
PUT  /api/v1/admin/users/:id      - Update user (ban/unban)
GET  /api/v1/admin/orders         - View all orders
PUT  /api/v1/admin/orders/:id     - Update order status
GET  /api/v1/admin/withdrawals    - View all withdrawals
PUT  /api/v1/admin/withdrawals/:id - Process withdrawal
GET  /api/v1/admin/claims          - View all claims
PUT  /api/v1/admin/claims/:id      - Resolve claim
GET  /api/v1/admin/settings        - Get system settings
PUT  /api/v1/admin/settings        - Update settings
GET  /api/v1/admin/analytics       - System analytics
```

### 5.9 Webhook Endpoints

```
POST /api/v1/webhooks/accesstrade - AccessTrade conversion webhook
POST /api/v1/webhooks/shopee      - Shopee affiliate webhook
POST /api/v1/webhooks/lazada      - Lazada affiliate webhook
```

***

## 6. UI/UX DESIGN SPECIFICATIONS

### 6.1 Design System

Based on the mockup provided, the UI follows a **dark glassmorphism** aesthetic:

#### Color Palette

```css
--bg-primary: #05070F;         /* Deep black-blue */
--bg-secondary: #0B0F19;       /* Dark navy */
--bg-card: rgba(17, 24, 39, 0.65); /* Glass panel */
--border-glass: rgba(255, 255, 255, 0.08);
--text-primary: #F3F4F6;       /* Off-white */
--text-secondary: #94A3B8;     /* Slate */
--accent-purple: #A855F7;      /* Neon Purple */
--accent-green: #22C55E;       /* Neon Green */
--accent-blue: #3B82F6;        /* Blue */
```

#### Typography

- **Primary Font**: Inter (body, UI elements)
- **Display Font**: Plus Jakarta Sans (headings, numbers, stats)
- **Monospace**: JetBrains Mono or system mono (codes, IDs)

#### Shadows & Effects

```css
--shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
--shadow-neon-purple: 0 0 20px rgba(168, 85, 247, 0.25);
--shadow-neon-green: 0 0 20px rgba(34, 197, 94, 0.25);
--glow-sphere-purple: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(0,0,0,0) 70%);
--glow-sphere-green: radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(0,0,0,0) 70%);
```

#### Glassmorphism Components

```css
.glass-panel {
  background: rgba(17, 24, 39, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

### 6.2 Layout Structure

#### Public Pages

1. **Landing Page** (`/`)
   - Hero section với CTA tạo link
   - Stats/Trust indicators
   - Partner platforms grid
   - How it works section
   - Footer
2. **Auth Pages**
   - `/login` - Google OAuth button
   - `/auth/callback` - OAuth callback handler

#### Authenticated App Layout (`/app/*`)

Sidebar navigation (collapsible on mobile) + Main content area

**Navigation Items:**

1. **Dashboard** (`/app/dashboard`) - Tổng quan thu nhập
2. **Tạo Link** (`/app/links`) - Tạo link hoàn tiền
3. **Đơn Hàng** (`/app/orders`) - Lịch sử đơn hàng
4. **Rút Tiền** (`/app/withdrawals`) - Rút tiền về tài khoản
5. **Giới Thiệu** (`/app/referrals`) - Giới thiệu bạn bè
6. **Khiếu Nại** (`/app/claims`) - Khiếu nại sót đơn
7. **Settings** (`/app/settings`) - Cài đặt tài khoản

#### Admin Layout (`/admin/*`)

Admin dashboard với:

- User management
- Order management
- Withdrawal processing
- Settings/configuration
- Analytics

### 6.3 Key UI Components

#### Dashboard Components

- **Stat Cards**: Glass panel cards hiển thị số dư (available, pending, total)
- **Earnings Chart**: Line/Area chart (Recharts or Chart.js) showing earnings over time
- **Recent Activity**: List of recent orders/conversions
- **Quick Actions**: Buttons để tạo link nhanh, rút tiền

#### Link Generator Components

- **URL Input**: Input với auto-detect platform
- **Generate Button**: CTA button với loading state
- **Result Card**: Hiển thị short link, copy button, QR code
- **Recent Links**: List các link vừa tạo

#### Order List Components

- **Filter Bar**: Dropdowns cho platform, status, date range
- **Search**: Search by order ID
- **Data Table**: Sortable table với pagination
- **Status Badges**: Color-coded status (Pending, Approved, Rejected)

#### Withdrawal Components

- **Balance Display**: Available balance indicator
- **Bank Select**: Dropdown chọn bank account
- **Amount Input**: VND amount với validation
- **Submit Button**: Create withdrawal request
- **History Table**: List previous withdrawals

### 6.4 Responsive Breakpoints

- **Mobile**: < 640px (Single column, stacked layout)
- **Tablet**: 640px - 1024px (Sidebar collapsible, 2-column grids)
- **Desktop**: > 1024px (Full sidebar, multi-column layouts)

### 6.5 Animation & Micro-interactions

- Page transitions: Fade + slight Y-translate (200ms ease-out)
- Glass panel hover: Subtle border glow intensification
- Button hover: Scale 1.02 + shadow increase
- Toast notifications: Slide in from right + fade
- Skeleton loading: Shimmer effect on glass panels
- Number counters: Count-up animation for stats

***

## 7. SECURITY & COMPLIANCE

### 7.1 Authentication & Authorization

- **Supabase Auth**: Secure JWT-based authentication
- **Row Level Security (RLS)**: All database tables have RLS policies
- **Middleware**: Route protection for authenticated/admin routes
- **CSRF Protection**: Built into Next.js API routes
- **Session Management**: HTTP-only cookies, secure flag

### 7.2 Data Protection

- **Encryption at Rest**: Supabase handles database encryption
- **Encryption in Transit**: TLS 1.3 for all connections
- **Sensitive Data**: Bank accounts encrypted with additional layer
- **API Keys**: AccessTrade keys stored in environment variables, never exposed to client

### 7.3 Rate Limiting

- **Upstash Redis**: Rate limiting on API routes
- **Limits**:
  - Link generation: 30 requests/minute per user
  - Withdrawal creation: 5 requests/hour per user
  - General API: 100 requests/minute per IP

### 7.4 Input Validation

- **Zod**: Schema validation for all API inputs
- **Sanitization**: DOMPurify for any HTML content
- **SQL Injection**: Protected by Supabase client (parameterized queries)

### 7.5 Compliance

- **GDPR**: Data export/deletion features
- **Vietnam Cybersecurity Law**: Local data storage (Supabase region selection)
- **Privacy Policy**: Required pages
- **Terms of Service**: User agreement on signup

***

## 8. DEPLOYMENT STRATEGY

### 8.1 Environments

1. **Development**: Local machines, local Supabase
2. **Staging**: Vercel Preview + Supabase project (staging)
3. **Production**: Vercel Production + Supabase project (prod)

### 8.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, develop]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 8.3 Database Migrations

- **Supabase CLI**: Manage migrations
- **Workflow**:
  ```bash
  supabase db diff -f migration_name
  supabase db push
  ```

### 8.4 Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AccessTrade
ACCESSTRADE_API_KEY=
ACCESSTRADE_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Inngest
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# Email (Resend/Postmark)
EMAIL_API_KEY=

# Vercel
VERCEL_URL=
```

### 8.5 Monitoring & Logging

- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking
- **Supabase Logs**: Database query logs
- **Inngest Dashboard**: Job queue monitoring

### 8.6 Backup Strategy

- **Supabase**: Automated daily backups (retention 7 days for free tier, configurable for paid)
- **Manual backups**: Before major migrations

***

## 9. DEVELOPMENT MILESTONES & TIMELINE

### Sprint 0: Setup & Foundation (Week 1)

- [ ] Repository setup, Vercel + Supabase projects created
- [ ] Database schema implemented in Supabase
- [ ] RLS policies configured
- [ ] Authentication flow (Google OAuth) working
- [ ] Base UI components (glassmorphism) created
- [ ] CI/CD pipeline configured

### Sprint 1: Core User Features (Weeks 2-3)

- [ ] Landing page with link converter (public)
- [ ] User dashboard layout with sidebar
- [ ] Link generation API + UI
- [ ] Order history table with filters
- [ ] Earnings overview dashboard
- [ ] Bank account management
- [ ] Withdrawal request flow

### Sprint 2: Integrations & Automation (Weeks 4-5)

- [ ] AccessTrade API integration
- [ ] Link conversion via AccessTrade
- [ ] Webhook handlers for conversion reports
- [ ] Order status synchronization
- [ ] Commission calculation with rates
- [ ] Email notifications (Resend integration)
- [ ] QR Code generation

### Sprint 3: Advanced Features (Weeks 6-7)

- [ ] Referral system (links, tracking, commissions)
- [ ] Missing order claim system
- [ ] Real-time notifications (Supabase Realtime)
- [ ] Advanced analytics charts
- [ ] Mobile responsiveness polish
- [ ] Performance optimization

### Sprint 4: Admin & Polish (Week 8)

- [ ] Admin dashboard
- [ ] User management
- [ ] Commission rate settings
- [ ] Withdrawal processing
- [ ] Claims management
- [ ] System settings
- [ ] Documentation
- [ ] Security audit

### Post-MVP Roadmap

- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Additional affiliate networks
- [ ] Multi-language support
- [ ] Advanced referral tiers
- [ ] API for partners

***

## 10. RISK MITIGATION

| Risk                          | Probability | Impact   | Mitigation                                                        |
| ----------------------------- | ----------- | -------- | ----------------------------------------------------------------- |
| AccessTrade API changes       | Medium      | High     | Abstract API layer, version pinning, monitoring                   |
| Vercel cold starts            | Medium      | Medium   | Edge functions, keep-warm strategies                              |
| Commission calculation errors | Low         | Critical | Extensive testing, audit logs, reconciliation                     |
| Withdrawal fraud              | Medium      | High     | Bank verification, rate limiting, manual review for large amounts |
| Platform policy changes       | Medium      | Medium   | Multi-platform strategy, terms compliance                         |

***

## 11. DOCUMENTATION & RESOURCES

### 11.1 Required Reading

- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [AccessTrade API Docs](https://api.accesstrade.vn/docs)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)

### 11.2 Code Conventions

- TypeScript strict mode enabled
- ESLint + Prettier configuration
- Conventional Commits (feat:, fix:, docs:, refactor:)
- Component naming: PascalCase
- File naming: kebab-case
- API routes: /api/v1/resource

### 11.3 Testing Strategy

- Unit tests: Vitest + React Testing Library
- Integration tests: Playwright
- E2E tests: Critical user flows
- API tests: Postman/Newman

***

**Document Version**: 1.0\
**Last Updated**: 2026-07-11\
**Author**: AI Assistant\
**Status**: Draft for Review
