-- The Wedding Dreams — Initial Postgres / Supabase Schema
-- Aligned with DATABASE.md and SECURITY.md

create extension if not exists pgcrypto;

-- 1. Enums
create type app_role as enum ('admin','editor','concierge');
create type listing_status as enum ('draft','published','archived');
create type application_status as enum ('pending_verification','under_review','approved','rejected','needs_info');
create type lead_status as enum ('new','contacted','shortlisted','site_visit','booked','lost');
create type tier as enum ('classic','grand','royal');
create type media_kind as enum ('video','image');
create type processing_status as enum ('queued','processing','ready','failed');

-- 2. Tables
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role app_role not null default 'concierge',
  mfa_enrolled boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  state text,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table venues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  tagline text,
  description text,
  city_id uuid references cities,
  area text,
  setting text check (setting in ('palace','heritage','farmhouse','beachfront','banquet','destination','resort')),
  capacity_min int check (capacity_min >= 0),
  capacity_max int check (capacity_max >= capacity_min),
  indoor boolean,
  outdoor boolean,
  tier tier not null,
  amenities jsonb not null default '[]',
  hero_media_id uuid,
  is_verified boolean not null default false,
  status listing_status not null default 'draft',
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  category text not null check (category in
    ('decorator','photographer','filmmaker','bridal_couture','jewellery','catering','mixology','entertainment','mehendi','makeup','other')),
  city_id uuid references cities,
  cities_served uuid[] not null default '{}',
  style text check (style in ('traditional','contemporary','fusion')),
  description text,
  tier tier not null,
  hero_media_id uuid,
  is_verified boolean not null default false,
  status listing_status not null default 'draft',
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Physically isolated private partner data (NEVER exposed in public views)
create table partner_private (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues on delete cascade,
  vendor_id uuid references vendors on delete cascade,
  contact_name text,
  phone text,
  email text,
  exact_pricing jsonb,
  gst_number text,
  pan_number text,
  commission_terms text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((venue_id is not null) <> (vendor_id is not null)),
  unique (venue_id),
  unique (vendor_id)
);

create table media_assets_4k (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('venue','vendor','hero','banner','real_wedding','journal')),
  owner_id uuid,
  kind media_kind not null,
  title text,
  alt_text text not null default '',
  master_path text, -- private bucket path, never exposed
  hls_url text,
  preview_mp4_url text,
  poster_url text,
  lqip text,
  width int,
  height int,
  duration_s numeric,
  bytes bigint,
  processing processing_status not null default 'queued',
  sort_order int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table partner_applications (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique not null,
  applicant_type text not null check (applicant_type in ('venue','vendor')),
  category text,
  business_name text not null,
  brand_story text check (char_length(brand_story) <= 1200),
  cities text[],
  year_established int check (year_established between 1900 and 2100),
  website text,
  instagram text,
  portfolio_links text[] check (cardinality(portfolio_links) <= 5),
  portfolio_media jsonb not null default '[]',
  tier tier,
  capacity int,
  lead_time_days int,
  pricing_notes text,
  gst_number text,
  verification_docs jsonb not null default '[]',
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  consent_at timestamptz not null,
  status application_status not null default 'pending_verification',
  reviewer_id uuid references profiles,
  review_note text,
  reviewed_at timestamptz,
  resulting_venue_id uuid references venues,
  resulting_vendor_id uuid references vendors,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table client_leads (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique not null,
  name text not null,
  email text not null,
  phone text,
  event_date date,
  city text,
  guest_count int check (guest_count between 1 and 5000),
  budget_tier tier,
  events_interested text[] not null default '{}',
  message text check (char_length(message) <= 2000),
  venue_id uuid references venues,
  vendor_id uuid references vendors,
  status lead_status not null default 'new',
  assigned_to uuid references profiles,
  source text,
  utm jsonb,
  consent_at timestamptz not null,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  anonymised_at timestamptz
);

create table lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references client_leads on delete cascade,
  author_id uuid references profiles,
  body text not null,
  created_at timestamptz not null default now()
);

create table cms_hero_slides (
  id uuid primary key default gen_random_uuid(),
  chapter_label text not null,
  headline text,
  subline text,
  media_id uuid references media_assets_4k,
  transition text not null default 'crossfade' check (transition in ('crossfade','arch_mask')),
  audio_url text,
  has_ambient_audio boolean not null default false,
  alt_description text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  updated_by uuid references profiles,
  updated_at timestamptz not null default now()
);

create table cms_banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null,
  title text,
  body text,
  cta_label text,
  cta_url text,
  media_id uuid references media_assets_4k,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int not null default 0
);

create table real_weddings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  story text,
  couple_names text,
  city_id uuid references cities,
  event_date date,
  hero_media_id uuid,
  venue_ids uuid[] not null default '{}',
  vendor_ids uuid[] not null default '{}',
  consent_documented boolean not null default false,
  status listing_status not null default 'draft',
  published_at timestamptz
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  blurb text,
  media_id uuid references media_assets_4k,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  consent_at timestamptz not null,
  confirmed_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  diff jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

-- 3. Indexes & Full-Text Search
create index idx_venues_status_city_tier on venues (status, city_id, tier);
create index idx_venues_amenities on venues using gin (amenities);
create index idx_vendors_status_cat_city_tier on vendors (status, category, city_id, tier);
create index idx_media_owner on media_assets_4k (owner_type, owner_id, sort_order);
create index idx_leads_status_created on client_leads (status, created_at desc);
create index idx_leads_assigned on client_leads (assigned_to);
create index idx_partner_apps_status on partner_applications (status, created_at desc);
create index idx_hero_active_order on cms_hero_slides (is_active, sort_order);
create index idx_audit_entity on audit_log (entity, entity_id, created_at desc);

alter table venues add column fts tsvector generated always as
  (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(description,''))) stored;
create index venues_fts on venues using gin (fts);

alter table vendors add column fts tsvector generated always as
  (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(category,'') || ' ' || coalesce(description,''))) stored;
create index vendors_fts on vendors using gin (fts);

-- 4. Public Allow-Listed Views (the ONLY objects anon may select)
create or replace view public_venues with (security_invoker = on) as
select v.id, v.slug, v.name, v.tagline, v.description, c.name as city, c.slug as city_slug,
       v.area, v.setting, v.capacity_min, v.capacity_max, v.indoor, v.outdoor, v.tier,
       v.amenities, v.hero_media_id, v.is_verified, v.seo_title, v.seo_description
from venues v
left join cities c on c.id = v.city_id
where v.status = 'published';

create or replace view public_vendors with (security_invoker = on) as
select v.id, v.slug, v.name, v.category, c.name as city, v.style, v.description, v.tier,
       v.hero_media_id, v.is_verified, v.seo_title, v.seo_description
from vendors v
left join cities c on c.id = v.city_id
where v.status = 'published';

create or replace view public_media with (security_invoker = on) as
select id, owner_type, owner_id, kind, title, alt_text, hls_url, preview_mp4_url,
       poster_url, lqip, width, height, duration_s, sort_order
from media_assets_4k
where is_public and processing = 'ready';

create or replace view public_hero_slides with (security_invoker = on) as
select s.id, s.chapter_label, s.headline, s.subline, s.transition, s.alt_description, s.sort_order,
       m.hls_url, m.preview_mp4_url, m.poster_url, m.lqip, s.audio_url
from cms_hero_slides s
join media_assets_4k m on m.id = s.media_id
where s.is_active
  and m.processing = 'ready'
  and (s.starts_at is null or s.starts_at <= now())
  and (s.ends_at is null or s.ends_at >= now());

-- 5. Core Triggers
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_venues_updated before update on venues for each row execute function set_updated_at();
create trigger trg_vendors_updated before update on vendors for each row execute function set_updated_at();
create trigger trg_partner_private_updated before update on partner_private for each row execute function set_updated_at();
create trigger trg_client_leads_updated before update on client_leads for each row execute function set_updated_at();
create trigger trg_hero_updated before update on cms_hero_slides for each row execute function set_updated_at();

create or replace function anonymise_old_leads() returns void language plpgsql security definer set search_path = public as $$
begin
  update client_leads
  set name = 'Anonymised Client',
      email = 'anonymised@redacted.invalid',
      phone = null,
      message = null,
      anonymised_at = now()
  where anonymised_at is null
    and created_at < now() - interval '24 months';
end;
$$;
