create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  phone text,
  referral_code text unique,
  referred_by uuid references public.users(id),
  is_banned boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
      and u.is_banned = false
  );
$$;

create table if not exists public.bank_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_name text not null,
  bank_code text not null,
  account_number text not null,
  account_holder text not null,
  is_default boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.platforms (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  code text not null unique,
  logo_url text,
  base_url text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.commission_rates (
  id uuid default gen_random_uuid() primary key,
  platform_id uuid references public.platforms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  user_rate_percent numeric(5,2) not null,
  platform_rate_percent numeric(5,2) not null,
  effective_from timestamp with time zone not null default timezone('utc'::text, now()),
  effective_to timestamp with time zone,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint valid_rate_percent check (user_rate_percent + platform_rate_percent = 100)
);

create table if not exists public.affiliate_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  platform_id uuid references public.platforms(id) on delete cascade not null,
  original_url text not null,
  short_code text not null unique,
  affiliate_url text not null,
  qr_code_url text,
  click_count integer not null default 0,
  conversion_count integer not null default 0,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  affiliate_link_id uuid references public.affiliate_links(id) on delete set null,
  platform_id uuid references public.platforms(id) on delete cascade not null,
  order_id_external text not null,
  order_value numeric(12,2) not null,
  commission_total numeric(12,2) not null,
  user_commission numeric(12,2) not null,
  platform_commission numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  click_time timestamp with time zone,
  conversion_time timestamp with time zone,
  audit_date timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint orders_platform_external_unique unique (platform_id, order_id_external)
);

create table if not exists public.withdrawals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_account_id uuid references public.bank_accounts(id) on delete set null,
  amount numeric(12,2) not null,
  fee numeric(12,2) not null default 0,
  net_amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'rejected')),
  processed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint valid_withdrawal_amount check (amount > 0)
);

create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  platform_id uuid references public.platforms(id) on delete cascade not null,
  order_id_external text not null,
  order_value numeric(12,2) not null,
  screenshot_url text,
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint claims_platform_external_unique unique (platform_id, order_id_external)
);

create table if not exists public.referral_commissions (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.users(id) on delete cascade not null,
  referred_id uuid references public.users(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  commission_amount numeric(12,2) not null,
  is_paid boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint referral_commissions_order_unique unique (order_id)
);

create table if not exists public.settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value jsonb not null,
  description text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_bank_accounts_user_id on public.bank_accounts(user_id);
create index if not exists idx_bank_accounts_is_default on public.bank_accounts(user_id, is_default);
create index if not exists idx_platforms_code on public.platforms(code);
create index if not exists idx_commission_rates_platform_id on public.commission_rates(platform_id);
create index if not exists idx_commission_rates_user_id on public.commission_rates(user_id);
create index if not exists idx_affiliate_links_user_id on public.affiliate_links(user_id);
create index if not exists idx_affiliate_links_short_code on public.affiliate_links(short_code);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at);
create index if not exists idx_withdrawals_user_id on public.withdrawals(user_id);
create index if not exists idx_withdrawals_status on public.withdrawals(status);
create index if not exists idx_claims_user_id on public.claims(user_id);
create index if not exists idx_referral_commissions_referrer on public.referral_commissions(referrer_id);
create index if not exists idx_referral_commissions_referred on public.referral_commissions(referred_id);
create index if not exists idx_settings_key on public.settings(key);
create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_withdrawals_updated_at on public.withdrawals;
create trigger set_withdrawals_updated_at
before update on public.withdrawals
for each row execute function public.set_updated_at();

drop trigger if exists set_claims_updated_at on public.claims;
create trigger set_claims_updated_at
before update on public.claims
for each row execute function public.set_updated_at();

drop trigger if exists set_settings_updated_at on public.settings;
create trigger set_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.platforms enable row level security;
alter table public.commission_rates enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.orders enable row level security;
alter table public.withdrawals enable row level security;
alter table public.claims enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.settings enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin"
on public.users
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "users_insert_own_or_admin" on public.users;
create policy "users_insert_own_or_admin"
on public.users
for insert
with check (auth.uid() = id or public.is_admin());

drop policy if exists "users_update_own_or_admin" on public.users;
create policy "users_update_own_or_admin"
on public.users
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "users_delete_admin_only" on public.users;
create policy "users_delete_admin_only"
on public.users
for delete
using (public.is_admin());

drop policy if exists "bank_accounts_select_own_or_admin" on public.bank_accounts;
create policy "bank_accounts_select_own_or_admin"
on public.bank_accounts
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "bank_accounts_insert_own_or_admin" on public.bank_accounts;
create policy "bank_accounts_insert_own_or_admin"
on public.bank_accounts
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "bank_accounts_update_own_or_admin" on public.bank_accounts;
create policy "bank_accounts_update_own_or_admin"
on public.bank_accounts
for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "bank_accounts_delete_own_or_admin" on public.bank_accounts;
create policy "bank_accounts_delete_own_or_admin"
on public.bank_accounts
for delete
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "platforms_select_authenticated" on public.platforms;
create policy "platforms_select_authenticated"
on public.platforms
for select
using (auth.uid() is not null);

drop policy if exists "platforms_admin_write" on public.platforms;
create policy "platforms_admin_write"
on public.platforms
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "commission_rates_select_authenticated" on public.commission_rates;
create policy "commission_rates_select_authenticated"
on public.commission_rates
for select
using (auth.uid() is not null);

drop policy if exists "commission_rates_admin_write" on public.commission_rates;
create policy "commission_rates_admin_write"
on public.commission_rates
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "affiliate_links_select_own_or_admin" on public.affiliate_links;
create policy "affiliate_links_select_own_or_admin"
on public.affiliate_links
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "affiliate_links_insert_own_or_admin" on public.affiliate_links;
create policy "affiliate_links_insert_own_or_admin"
on public.affiliate_links
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "affiliate_links_update_own_or_admin" on public.affiliate_links;
create policy "affiliate_links_update_own_or_admin"
on public.affiliate_links
for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "affiliate_links_delete_own_or_admin" on public.affiliate_links;
create policy "affiliate_links_delete_own_or_admin"
on public.affiliate_links
for delete
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_write" on public.orders;
create policy "orders_admin_write"
on public.orders
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "withdrawals_select_own_or_admin" on public.withdrawals;
create policy "withdrawals_select_own_or_admin"
on public.withdrawals
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "withdrawals_insert_own_or_admin" on public.withdrawals;
create policy "withdrawals_insert_own_or_admin"
on public.withdrawals
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "withdrawals_admin_write" on public.withdrawals;
create policy "withdrawals_admin_write"
on public.withdrawals
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "withdrawals_admin_delete" on public.withdrawals;
create policy "withdrawals_admin_delete"
on public.withdrawals
for delete
using (public.is_admin());

drop policy if exists "claims_select_own_or_admin" on public.claims;
create policy "claims_select_own_or_admin"
on public.claims
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "claims_insert_own_or_admin" on public.claims;
create policy "claims_insert_own_or_admin"
on public.claims
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "claims_admin_write" on public.claims;
create policy "claims_admin_write"
on public.claims
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "claims_admin_delete" on public.claims;
create policy "claims_admin_delete"
on public.claims
for delete
using (public.is_admin());

drop policy if exists "referral_commissions_select_related_or_admin" on public.referral_commissions;
create policy "referral_commissions_select_related_or_admin"
on public.referral_commissions
for select
using (auth.uid() = referrer_id or auth.uid() = referred_id or public.is_admin());

drop policy if exists "referral_commissions_admin_write" on public.referral_commissions;
create policy "referral_commissions_admin_write"
on public.referral_commissions
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "settings_select_authenticated" on public.settings;
create policy "settings_select_authenticated"
on public.settings
for select
using (auth.uid() is not null);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write"
on public.settings
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "activity_logs_select_own_or_admin" on public.activity_logs;
create policy "activity_logs_select_own_or_admin"
on public.activity_logs
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "activity_logs_admin_write" on public.activity_logs;
create policy "activity_logs_admin_write"
on public.activity_logs
for all
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to authenticated, service_role;

grant select on public.platforms to authenticated, service_role;
grant select on public.commission_rates to authenticated, service_role;
grant select, insert, update, delete on public.users to authenticated, service_role;
grant select, insert, update, delete on public.bank_accounts to authenticated, service_role;
grant select, insert, update, delete on public.affiliate_links to authenticated, service_role;
grant select, insert, update, delete on public.orders to authenticated, service_role;
grant select, insert, update, delete on public.withdrawals to authenticated, service_role;
grant select, insert, update, delete on public.claims to authenticated, service_role;
grant select, insert, update, delete on public.referral_commissions to authenticated, service_role;
grant select on public.settings to authenticated, service_role;
grant select, insert, update, delete on public.settings to service_role;
grant select, insert, update, delete on public.activity_logs to authenticated, service_role;
