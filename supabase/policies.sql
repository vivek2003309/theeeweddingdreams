-- The Wedding Dreams — Forced Row-Level Security Policies
-- Re-applied idempotently per DATABASE.md §10 and SECURITY.md §3

alter table venues enable row level security;
alter table venues force row level security;
alter table vendors enable row level security;
alter table vendors force row level security;
alter table partner_private enable row level security;
alter table partner_private force row level security;
alter table media_assets_4k enable row level security;
alter table media_assets_4k force row level security;
alter table partner_applications enable row level security;
alter table partner_applications force row level security;
alter table client_leads enable row level security;
alter table client_leads force row level security;
alter table lead_notes enable row level security;
alter table lead_notes force row level security;
alter table cms_hero_slides enable row level security;
alter table cms_hero_slides force row level security;
alter table cms_banners enable row level security;
alter table cms_banners force row level security;
alter table real_weddings enable row level security;
alter table real_weddings force row level security;
alter table experiences enable row level security;
alter table experiences force row level security;
alter table newsletter_subscribers enable row level security;
alter table newsletter_subscribers force row level security;
alter table audit_log enable row level security;
alter table audit_log force row level security;
alter table profiles enable row level security;
alter table profiles force row level security;
alter table cities enable row level security;
alter table cities force row level security;

create or replace function is_staff(r app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and is_active = true
      and role = any(r)
  );
$$;

-- Revoke base-table access from anon and expose only public_* views
revoke all on venues, vendors, partner_private, media_assets_4k, partner_applications,
  client_leads, lead_notes, cms_hero_slides, cms_banners, real_weddings, experiences,
  newsletter_subscribers, audit_log, profiles, cities from anon;

grant select on public_venues, public_vendors, public_media, public_hero_slides to anon, authenticated;
grant insert on client_leads, partner_applications, newsletter_subscribers to anon;

-- Public listings policies
drop policy if exists venues_public on venues;
create policy venues_public on venues for select to anon, authenticated using (status = 'published');

drop policy if exists venues_staff_read on venues;
create policy venues_staff_read on venues for select to authenticated using (is_staff('{admin,editor,concierge}'));

drop policy if exists venues_edit on venues;
create policy venues_edit on venues for all to authenticated
  using (is_staff('{admin,editor}')) with check (is_staff('{admin,editor}'));

drop policy if exists vendors_public on vendors;
create policy vendors_public on vendors for select to anon, authenticated using (status = 'published');

drop policy if exists vendors_staff_read on vendors;
create policy vendors_staff_read on vendors for select to authenticated using (is_staff('{admin,editor,concierge}'));

drop policy if exists vendors_edit on vendors;
create policy vendors_edit on vendors for all to authenticated
  using (is_staff('{admin,editor}')) with check (is_staff('{admin,editor}'));

-- Private partner data (Editor explicitly denied)
drop policy if exists pp_read on partner_private;
create policy pp_read on partner_private for select to authenticated using (is_staff('{admin,concierge}'));

drop policy if exists pp_write on partner_private;
create policy pp_write on partner_private for all to authenticated
  using (is_staff('{admin}')) with check (is_staff('{admin}'));

-- Client leads (Anon insert-only with forced safe defaults)
drop policy if exists leads_anon_insert on client_leads;
create policy leads_anon_insert on client_leads for insert to anon
  with check (status = 'new' and assigned_to is null and consent_at is not null);

drop policy if exists leads_staff on client_leads;
create policy leads_staff on client_leads for all to authenticated
  using (is_staff('{admin,concierge}')) with check (is_staff('{admin,concierge}'));

drop policy if exists lead_notes_staff on lead_notes;
create policy lead_notes_staff on lead_notes for all to authenticated
  using (is_staff('{admin,concierge}')) with check (is_staff('{admin,concierge}'));

-- Partner applications
drop policy if exists apps_anon_insert on partner_applications;
create policy apps_anon_insert on partner_applications for insert to anon
  with check (status = 'pending_verification' and reviewer_id is null and consent_at is not null);

drop policy if exists apps_admin on partner_applications;
create policy apps_admin on partner_applications for all to authenticated
  using (is_staff('{admin}')) with check (is_staff('{admin}'));

drop policy if exists apps_editor_read on partner_applications;
create policy apps_editor_read on partner_applications for select to authenticated
  using (is_staff('{editor}'));

-- Media
drop policy if exists media_public on media_assets_4k;
create policy media_public on media_assets_4k for select to anon using (is_public and processing = 'ready');

drop policy if exists media_staff on media_assets_4k;
create policy media_staff on media_assets_4k for all to authenticated
  using (is_staff('{admin,editor}')) with check (is_staff('{admin,editor}'));

-- Hero slides
drop policy if exists hero_public on cms_hero_slides;
create policy hero_public on cms_hero_slides for select to anon using (is_active);

drop policy if exists hero_staff on cms_hero_slides;
create policy hero_staff on cms_hero_slides for all to authenticated
  using (is_staff('{admin,editor}')) with check (is_staff('{admin,editor}'));

-- Audit log (Admin read-only; inserts via triggers)
drop policy if exists audit_admin on audit_log;
create policy audit_admin on audit_log for select to authenticated using (is_staff('{admin}'));
