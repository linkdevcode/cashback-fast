insert into public.platforms (name, code, logo_url, base_url, is_active)
values
  ('Shopee', 'shopee', null, 'https://shopee.vn', true),
  ('Lazada', 'lazada', null, 'https://www.lazada.vn', true),
  ('TikTok Shop', 'tiktok', null, 'https://www.tiktok.com/shop', true),
  ('Tiki', 'tiki', null, 'https://tiki.vn', true)
on conflict (code) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  base_url = excluded.base_url,
  is_active = excluded.is_active;

insert into public.settings (key, value, description)
values
  ('min_withdrawal_amount', to_jsonb(50000), 'Số tiền rút tối thiểu (VND)'),
  ('default_user_commission_rate', to_jsonb(80), 'Tỷ lệ hoa hồng mặc định cho user (%)'),
  ('referral_commission_rate', to_jsonb(5), 'Tỷ lệ chia sẻ hoa hồng referral (%)'),
  ('platform_fees', '{}'::jsonb, 'Cấu hình phí theo platform')
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description;
