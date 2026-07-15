# TODO — Hoàn Tiền Pro (cashback-fast)

Checklist theo dõi tiến độ dự án. Cập nhật `[ ]` → `[x]` khi hoàn thành.


|                  |                                                               |
| ---------------- | ------------------------------------------------------------- |
| **Sản phẩm**     | Nền tảng cashback affiliate (kiểu chietkhau.pro)              |
| **UI reference** | `mockup/cashback_pro_sleek_dark_glassmorphism_platform.html`  |
| **Docs**         | `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md` |
| **Stack**        | Next.js 14 · Tailwind · Supabase · Vercel · AccessTrade       |
| **Ưu tiên**      | P0 = MVP · P1 = Growth · P2 = Polish                          |


**Cách dùng:** làm tuần tự theo Sprint. Trong mỗi Sprint, ưu tiên task `P0` trước. Ghi ngày/commit bên cạnh task nếu cần audit.

---



## Tiến độ tổng quan


| Phase        | Sprint | Trọng tâm                                             | Status        |
| ------------ | ------ | ----------------------------------------------------- | ------------- |
| Foundation   | 0      | Setup, DB, Auth, Design system                        | ✅ Done        |
| MVP Core     | 1      | Landing, App shell, Links, Orders, Earnings, Withdraw | 🟡 In progress |
| Integrations | 2      | AccessTrade, Webhooks, Commission, Email, QR          | ⬜ Not started |
| Growth       | 3      | Referral, Claims, Charts, Mobile polish               | ⬜ Not started |
| Admin & Ship | 4      | Admin dashboard, Settings, Docs, Security             | ⬜ Not started |
| Post-MVP     | —      | Mobile app, Extension, Multi-network                  | ⬜ Backlog     |


**Legend:** ⬜ Not started · 🟡 In progress · ✅ Done

---



## Sprint 0 — Setup & Foundation (P0)

> Mục tiêu: repo chạy được local, DB + Auth sẵn sàng, design tokens khớp mockup.



### 0.1 Project bootstrap

- [x] Khởi tạo Next.js 14 (App Router) + TypeScript strict
- [x] Cấu hình Tailwind CSS + PostCSS theo `docs/CONVENTIONS.md`
- [x] ESLint + Prettier + Conventional Commits
- [x] Cấu trúc thư mục theo CONVENTIONS (`app/`, `components/`, `lib/`, `hooks/`, `types/`)
- [x] `.env.example` (Supabase, AccessTrade, Resend, feature flags)
- [x] `.gitignore`, README tối thiểu (cách chạy local)
- [x] `vercel.json` (region `sin1`, rewrite `/go/:code`, crons stub)



### 0.2 Infrastructure

- [x] Tạo Supabase project (dev) + local CLI (optional)
- [x] Tạo Vercel project, connect Git repo
- [x] Cấu hình Google provider trực tiếp trong Supabase Auth Dashboard
- [x] CI cơ bản (GitHub Actions: lint + type-check) — deploy sau khi có code



### 0.3 Database schema & RLS

- [x] Migration: `users`, `bank_accounts`, `platforms`, `commission_rates`
- [x] Migration: `affiliate_links`, `orders`, `withdrawals`, `claims`
- [x] Migration: `referral_commissions`, `settings`, `activity_logs`
- [x] Indexes theo SPEC §4.1
- [x] Seed: platforms (Shopee, Lazada, TikTok Shop, Tiki) + default settings
- [x] RLS policies cho mọi bảng user-owned
- [x] Supabase clients: `lib/db/server.ts`, `client.ts`, `middleware.ts`



### 0.4 Auth foundation

- [x] Google OAuth login flow (Supabase Auth)
- [x] `/login` + `/auth/callback`
- [x] Sync profile vào `public.users` khi đăng ký lần đầu
- [x] Middleware bảo vệ `/app/*`, `/admin/*`, `/api/v1/*` (trừ public/webhook)
- [x] Session refresh / logout



### 0.5 Design system (theo mockup)

- [x] CSS variables: dark glassmorphism palette (SPEC §6.1)
- [x] Fonts: Plus Jakarta Sans (display) + Inter (body)
- [x] Utility classes: `.glass-panel`, neon glow, gradient text
- [x] Base UI: Button, Input, Card, Dialog, Select, Table, Tabs, Toast, Badge, Skeleton
- [x] Layout shells: Root layout, App sidebar, Mobile nav, Footer
- [x] Micro-interactions: fade/slide page transition, hover glow, shimmer skeleton

**Definition of Done (Sprint 0):** `npm run dev` chạy được; login Google OK; schema + RLS đã apply; UI kit render được vài component glass trên trang trống.

---



## Sprint 1 — Core User Features / MVP UI (P0)

> Mục tiêu: user flow chính khớp mockup — landing → tạo link → dashboard → đơn → rút tiền (có thể mock AccessTrade).



### 1.1 Landing page (`/`) — khớp mockup

- [x] Floating glass navbar (logo, nav links, CTA đăng nhập)
- [x] Hero + live demo link converter (public CTA)
- [x] Trust / stats section
- [x] Partner platforms grid (Shopee, Lazada, TikTok, Tiki)
- [x] How it works
- [x] Footer
- [x] Responsive mobile/tablet/desktop



### 1.2 App shell (`/app/*`)

- [x] Authenticated layout + sidebar (Dashboard, Tạo Link, Đơn Hàng, Rút Tiền, Giới Thiệu, Khiếu Nại, Settings)
- [x] Active tab state + mobile collapsible / bottom nav
- [x] User menu (avatar, logout)
- [x] Protected route redirect → `/login?redirect=...`



### 1.3 Link generation (`/app/links`) — F2

- [x] API: `POST/GET/DELETE /api/v1/links` (+ Zod validation)
- [x] Auto-detect platform từ URL
- [x] Generate short code + lưu `affiliate_links` (mock affiliate URL nếu chưa có AccessTrade)
- [x] Redirect short link: `/go/:code` → affiliate URL (+ click count)
- [x] UI: URL input, generate CTA, result card (copy), recent links (last 50)
- [x] Rate limit in-memory: 30 req/min/user (ARCHITECTURE §8)



### 1.4 Orders (`/app/orders`) — F3

- [ ] API: `GET /api/v1/orders`, `GET /api/v1/orders/stats`, `GET /api/v1/orders/:id`
- [ ] UI: filter (platform, status, date), search order ID, table + pagination (20/page)
- [ ] Status badges: Pending / Approved / Rejected
- [ ] Seed/mock orders để demo UI nếu chưa có webhook



### 1.5 Earnings dashboard (`/app/dashboard`) — F4

- [ ] API: `GET /api/v1/earnings/dashboard`, `/history`, `/platforms`
- [ ] Stat cards: Available / Pending / Total Earned
- [ ] Earnings chart (7 / 30 / 90 ngày) — Recharts hoặc tương đương
- [ ] Platform breakdown + recent activity
- [ ] Quick actions: tạo link, rút tiền



### 1.6 Withdrawals (`/app/withdrawals`) — F5

- [ ] API banks: `POST/GET/DELETE /api/v1/banks`
- [ ] API withdrawals: `POST/GET /api/v1/withdrawals`
- [ ] Validation: min 50.000đ, max = available balance
- [ ] UI: balance indicator, bank form/select, amount, submit
- [ ] Withdrawal history table + status tracking
- [ ] Rate limit: 5 withdrawals/hour/user



### 1.7 Settings (`/app/settings`)

- [ ] Profile view/edit (name, phone, avatar)
- [ ] Quản lý bank accounts (CRUD)
- [ ] Legal links placeholder (Privacy / Terms)

**Definition of Done (Sprint 1):** Full happy-path UI theo mockup với data mock/local; chưa bắt buộc AccessTrade thật.

---



## Sprint 2 — Integrations & Automation (P0)

> Mục tiêu: tiền thật flow — tạo link affiliate thật, nhận conversion, tính hoa hồng.



### 2.1 AccessTrade integration

- [ ] Abstract affiliate provider layer (`lib/affiliates/`)
- [ ] AccessTrade: auth, create tracking link, error handling
- [ ] Map platform codes ↔ AccessTrade campaigns
- [ ] Feature flag / fallback mock khi thiếu API key



### 2.2 Webhooks & order sync

- [ ] `POST /api/v1/webhooks/accesstrade` (verify signature nếu có)
- [ ] Persist conversions → `orders` (idempotent theo `order_id_external`)
- [ ] Map link/user từ tracking params / short_code
- [ ] Cron: `/api/cron/sync-orders` (poll mỗi 10 phút — backup cho webhook miss)
- [ ] Status sync: pending → approved / rejected



### 2.3 Commission engine

- [ ] Resolve rate: per-user override → per-platform → global default
- [ ] Split `commission_total` → `user_commission` + `platform_commission`
- [ ] Recalculate available / pending balances từ orders + withdrawals
- [ ] Activity log cho mọi thay đổi số dư / status



### 2.4 QR & notifications

- [ ] Generate QR cho short/affiliate link (`GET /api/v1/links/:id/qr`)
- [ ] Lưu `qr_code_url` (Supabase Storage nếu cần)
- [ ] Email (Resend): withdrawal status change
- [ ] Email templates cơ bản (welcome optional)



### 2.5 Hardening MVP

- [ ] Zod trên mọi API input
- [ ] Consistent API response (`createSuccessResponse` / `createErrorResponse`)
- [ ] Logger utility
- [ ] Env validation lúc boot (thiếu key → fail rõ ràng)

**Definition of Done (Sprint 2):** Paste link Shopee/Lazada → ra affiliate link thật; webhook/cron tạo order; số dư dashboard khớp commission rates.

---



## Sprint 3 — Growth Features (P1)



### 3.1 Referral system — F7

- [ ] Unique `referral_code` khi tạo user
- [ ] Capture `?ref=` lúc đăng ký → `referred_by`
- [ ] API: `/api/v1/referrals`, `/link`, `/friends`, `/commissions`
- [ ] UI `/app/referrals`: stats, copy link, friends list, commission history
- [ ] Khi order approved: cộng referral commission theo `settings.referral_commission_rate`
- [ ] Feature flag `NEXT_PUBLIC_ENABLE_REFERRALS`



### 3.2 Missing order claims — F6

- [ ] API: `POST/GET /api/v1/claims`
- [ ] Upload screenshot → Supabase Storage
- [ ] UI `/app/claims`: form + history + status
- [ ] Notify admin khi có claim mới (email hoặc inbox admin)
- [ ] Feature flag `NEXT_PUBLIC_ENABLE_CLAIMS`



### 3.3 UX polish

- [ ] Chart/analytics nâng cao trên dashboard
- [ ] Toast + skeleton đồng bộ toàn app
- [ ] Mobile responsiveness audit (so mockup)
- [ ] Performance: image/font optimize, RSC boundaries

**Definition of Done (Sprint 3):** Referral + Claims dùng được end-to-end; UI mobile ổn định.

---



## Sprint 4 — Admin & Ship (P1)



### 4.1 Admin dashboard (`/admin/*`) — F8

- [ ] Admin gate (`users.is_admin`)
- [ ] User management: list, ban/unban, detail
- [ ] Order management: view all, manual status update
- [ ] Withdrawal processing: approve / reject / mark completed
- [ ] Claims management: investigate / resolve / reject
- [ ] Commission rate settings (global + per-platform)
- [ ] System settings: min withdrawal, referral rate, fees
- [ ] Analytics: revenue, user growth, platform performance
- [ ] Admin APIs theo SPEC §5.8



### 4.2 Legal & compliance (MVP)

- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Consent checkbox / note khi signup (nếu cần)



### 4.3 Quality & launch

- [ ] Unit tests trọng yếu (commission calc, platform detect, rate limit)
- [ ] E2E smoke: login → create link → view orders (Playwright)
- [ ] Security pass: RLS review, env secrets, webhook auth
- [ ] Monitoring: Vercel Analytics; Sentry optional
- [ ] Staging deploy + UAT checklist
- [ ] Production deploy + backup/migration runbook ngắn

**Definition of Done (Sprint 4):** Admin vận hành được rút tiền & claims; staging/prod sẵn sàng soft-launch.

---



## Post-MVP Backlog (P2)

Không làm trong MVP trừ khi có nhu cầu rõ.

### Platform & product

- [ ] Thêm platform AccessTrade (Sendo, …) — F9.1
- [ ] Multi-currency preparation — F9.2
- [ ] Bulk link generation (CSV) — F10.4
- [ ] Link analytics (clicks, conversion rate) — F10.5
- [ ] Realtime notifications (Supabase Realtime) — F10.1
- [ ] Browser extension — F10.3
- [ ] Mobile app (React Native / Expo) — F10.2
- [ ] Multi-language (i18n)
- [ ] Partner public API



### Security & scale

- [ ] 2FA — F11.1
- [ ] KYC cho rút tiền lớn — F11.2
- [ ] Fraud detection — F11.3
- [ ] GDPR export/delete tools — F11.4
- [ ] Upstash Redis rate limit (thay in-memory khi scale)
- [ ] Inngest / queue cho webhook & withdrawal jobs
- [ ] VietQR / Napas payout automation

---



## Checklist theo feature ID (tham chiếu nhanh)

Dùng để đối chiếu SPEC §3 khi review.

### P0 — Must Have


| ID        | Feature                                     | Sprint | Done |
| --------- | ------------------------------------------- | ------ | ---- |
| F1.1–F1.4 | Auth (Google, profile, session, middleware) | 0      | [ ]  |
| F2.1–F2.6 | Affiliate link generation + QR + history    | 1–2    | [ ]  |
| F3.1–F3.5 | Order tracking + webhook + filters          | 1–2    | [ ]  |
| F4.1–F4.4 | Earnings dashboard                          | 1      | [ ]  |
| F5.1–F5.6 | Withdrawals + banks + email                 | 1–2    | [ ]  |
| F6.1–F6.4 | Missing order claims                        | 3      | [ ]  |




### P1 — Should Have


| ID        | Feature                             | Sprint | Done |
| --------- | ----------------------------------- | ------ | ---- |
| F7.1–F7.4 | Referral system                     | 3      | [ ]  |
| F8.1–F8.7 | Admin dashboard                     | 4      | [ ]  |
| F9.1–F9.2 | Platform expansion / multi-currency | Post   | [ ]  |




### P2 — Nice to Have


| ID    | Feature                        | Done |
| ----- | ------------------------------ | ---- |
| F10.x | Advanced product features      | [ ]  |
| F11.x | Security & compliance nâng cao | [ ]  |


---



## Quy ước cập nhật TODO

1. Bắt đầu Sprint → đổi status bảng tổng quan sang 🟡.
2. Tick `[x]` ngay khi merge/hoàn thành task (không đợi hết sprint).
3. Nếu scope đổi so với SPEC/ARCHITECTURE → ghi note ngắn dưới task (ví dụ: *"Dùng Server Actions thay API route cho banks"*).
4. Không tick DoD Sprint khi còn blocker P0 chưa xong.
5. Post-MVP chỉ kéo vào sprint hiện tại khi đã ship MVP ổn định.

---

**Version:** 1.0  
**Created:** 2026-07-14  
**Based on:** SPEC / ARCHITECTURE / CONVENTIONS (2026-07-11) + mockup glassmorphism