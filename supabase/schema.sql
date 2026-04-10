-- Solo Agency OS — Full Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create type user_role as enum ('owner', 'freelancer', 'client');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  role user_role not null default 'owner',
  tenant_id uuid, -- which agency this user belongs to (null for owners, they ARE the tenant)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TENANTS (each agency owner = one tenant)
-- ============================================================
create table tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  agency_name text not null default 'My Agency',
  agency_logo_url text,
  owner_name text not null default '',
  owner_email text not null default '',
  -- Stripe
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_subscription_status text default 'inactive',
  -- API keys (encrypted at rest by Supabase)
  google_pagespeed_api_key text,
  resend_api_key text,
  -- Preferences
  notification_preferences jsonb default '{"email_reports": true, "email_support": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- After creating a tenant, update the owner's tenant_id
-- (handled in application code via trigger or signup flow)

-- ============================================================
-- CLIENTS
-- ============================================================
create type client_status as enum ('active', 'paused', 'completed', 'churned');

create table clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  logo_url text,
  contact_name text not null default '',
  contact_email text not null default '',
  services text[] default '{}', -- multi-select: Web Design, SEO, Social Media, Content, Other
  retainer_amount numeric(10,2) default 0,
  billing_date integer default 1, -- day of month
  contract_url text, -- file URL or link
  website_url text,
  platform text default 'Other', -- WordPress, Webflow, Framer, Squarespace, Shopify, Other
  hosting_notes text,
  start_date date,
  end_date date,
  status client_status not null default 'active',
  notes text,
  -- Client portal user (if invited)
  portal_user_id uuid references profiles(id) on delete set null,
  portal_invite_token text,
  portal_invite_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CLIENT ONBOARDING CHECKLIST
-- ============================================================
create table onboarding_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  label text not null,
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CLIENT ASSIGNED FREELANCERS
-- ============================================================
create table client_freelancers (
  client_id uuid not null references clients(id) on delete cascade,
  freelancer_id uuid not null references profiles(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  primary key (client_id, freelancer_id)
);

-- ============================================================
-- FREELANCERS (extra profile data for freelancer role)
-- ============================================================
create type freelancer_status as enum ('active', 'on-deck', 'inactive', 'pending');

create table freelancer_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  role_title text not null default '',
  hourly_rate numeric(10,2),
  flat_rate numeric(10,2),
  skills text[] default '{}',
  status freelancer_status not null default 'active',
  bio text,
  internal_notes text, -- owner only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROJECTS (timeline entries)
-- ============================================================
create type project_status as enum ('active', 'completed', 'on_hold', 'pending');

create table projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  service text not null default 'Web Design',
  status project_status not null default 'active',
  platform text default 'Other',
  hosting_location text,
  start_date date not null,
  end_date date not null,
  description text,
  budget numeric(10,2),
  contract_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROJECT TEAM MEMBERS (many-to-many)
-- ============================================================
create table project_members (
  project_id uuid not null references projects(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  primary key (project_id, profile_id)
);

-- ============================================================
-- TASKS
-- ============================================================
create type task_status as enum ('todo', 'in_progress', 'in_review', 'done');

create table tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority integer not null default 3, -- 1=urgent, 2=high, 3=medium, 4=low
  due_date date,
  assigned_to uuid references profiles(id) on delete set null,
  completed_at timestamptz,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CLIENT REQUESTS (client-facing kanban)
-- ============================================================
create type request_status as enum ('incoming', 'in_progress', 'done');

create table client_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  submitted_by uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  status request_status not null default 'incoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SITE HEALTH
-- ============================================================
create table site_health (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  url text not null,
  performance_score integer,
  accessibility_score integer,
  seo_score integer,
  best_practices_score integer,
  is_up boolean default true,
  last_checked_at timestamptz,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- MONTHLY REPORTS
-- ============================================================
create table monthly_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  month integer not null, -- 1-12
  year integer not null,
  -- Snapshot data
  site_health_snapshot jsonb,
  tasks_completed jsonb, -- array of task summaries
  open_requests integer default 0,
  owner_notes text,
  -- Delivery
  share_token text unique default gen_random_uuid()::text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, client_id, month, year)
);

-- ============================================================
-- NOTES
-- ============================================================
create table note_folders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  icon text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  folder_id uuid references note_folders(id) on delete set null,
  title text not null default 'Untitled',
  content text not null default '',
  is_pinned boolean default false,
  color text default 'default',
  author_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SOPs
-- ============================================================
create type sop_status as enum ('draft', 'active', 'under_review', 'archived');

create table sops (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'Internal',
  status sop_status not null default 'draft',
  steps jsonb not null default '[]'::jsonb, -- array of {title, description, isOptional}
  author_id uuid references profiles(id) on delete set null,
  last_reviewed_by uuid references profiles(id) on delete set null,
  version text default '1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
create type ticket_priority as enum ('low', 'medium', 'high');
create type ticket_status as enum ('open', 'in_progress', 'resolved');

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  subject text not null,
  description text not null,
  priority ticket_priority not null default 'medium',
  status ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null, -- e.g. 'task.completed', 'client.created', 'request.submitted'
  entity_type text, -- 'task', 'client', 'request', etc.
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_profiles_tenant on profiles(tenant_id);
create index idx_profiles_role on profiles(role);
create index idx_clients_tenant on clients(tenant_id);
create index idx_clients_status on clients(tenant_id, status);
create index idx_projects_tenant on projects(tenant_id);
create index idx_projects_client on projects(client_id);
create index idx_tasks_tenant on tasks(tenant_id);
create index idx_tasks_assigned on tasks(assigned_to);
create index idx_tasks_client on tasks(client_id);
create index idx_tasks_project on tasks(project_id);
create index idx_tasks_priority on tasks(tenant_id, priority);
create index idx_client_requests_client on client_requests(client_id);
create index idx_client_requests_tenant on client_requests(tenant_id);
create index idx_site_health_client on site_health(client_id);
create index idx_notes_tenant on notes(tenant_id);
create index idx_sops_tenant on sops(tenant_id);
create index idx_support_tickets_user on support_tickets(user_id);
create index idx_support_messages_ticket on support_messages(ticket_id);
create index idx_activity_log_tenant on activity_log(tenant_id);
create index idx_monthly_reports_share on monthly_reports(share_token);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Helper function: get current user's tenant_id
create or replace function get_my_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from profiles where id = auth.uid()
$$;

-- Helper function: get current user's role
create or replace function get_my_role()
returns user_role
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid()
$$;

-- Helper function: check if current user is super admin
create or replace function is_super_admin()
returns boolean
language sql
security definer
stable
as $$
  select email = current_setting('app.super_admin_email', true)
  from auth.users
  where id = auth.uid()
$$;

-- ── PROFILES ──
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can view same-tenant profiles"
  on profiles for select
  using (tenant_id = get_my_tenant_id());

create policy "Owners can view their tenant profiles"
  on profiles for select
  using (
    get_my_role() = 'owner'
    and tenant_id = (select id from tenants where owner_id = auth.uid())
  );

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- ── TENANTS ──
alter table tenants enable row level security;

create policy "Owners can manage own tenant"
  on tenants for all
  using (owner_id = auth.uid());

create policy "Members can view their tenant"
  on tenants for select
  using (id = get_my_tenant_id());

-- ── CLIENTS ──
alter table clients enable row level security;

create policy "Tenant members can view clients"
  on clients for select
  using (tenant_id = get_my_tenant_id() or tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Owners can manage clients"
  on clients for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Freelancers can view assigned clients"
  on clients for select
  using (
    get_my_role() = 'freelancer'
    and id in (select client_id from client_freelancers where freelancer_id = auth.uid())
  );

create policy "Clients can view own record"
  on clients for select
  using (portal_user_id = auth.uid());

-- ── ONBOARDING ITEMS ──
alter table onboarding_items enable row level security;

create policy "Tenant access to onboarding items"
  on onboarding_items for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

-- ── CLIENT FREELANCERS ──
alter table client_freelancers enable row level security;

create policy "Tenant access to client_freelancers"
  on client_freelancers for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Freelancers can see own assignments"
  on client_freelancers for select
  using (freelancer_id = auth.uid());

-- ── FREELANCER PROFILES ──
alter table freelancer_profiles enable row level security;

create policy "Owners manage freelancer profiles"
  on freelancer_profiles for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Freelancers view own profile"
  on freelancer_profiles for select
  using (id = auth.uid());

-- ── PROJECTS ──
alter table projects enable row level security;

create policy "Tenant access to projects"
  on projects for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Members can view projects"
  on projects for select
  using (tenant_id = get_my_tenant_id());

-- ── PROJECT MEMBERS ──
alter table project_members enable row level security;

create policy "Tenant access to project members"
  on project_members for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Members can view project memberships"
  on project_members for select
  using (tenant_id = get_my_tenant_id());

-- ── TASKS ──
alter table tasks enable row level security;

create policy "Owners manage tasks"
  on tasks for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Freelancers view assigned tasks"
  on tasks for select
  using (assigned_to = auth.uid());

create policy "Freelancers update assigned tasks"
  on tasks for update
  using (assigned_to = auth.uid());

-- ── CLIENT REQUESTS ──
alter table client_requests enable row level security;

create policy "Owners manage requests"
  on client_requests for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Clients can view own requests"
  on client_requests for select
  using (
    client_id in (select id from clients where portal_user_id = auth.uid())
  );

create policy "Clients can insert own requests"
  on client_requests for insert
  with check (
    submitted_by = auth.uid()
    and client_id in (select id from clients where portal_user_id = auth.uid())
  );

-- ── SITE HEALTH ──
alter table site_health enable row level security;

create policy "Owners manage site health"
  on site_health for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Clients view own health"
  on site_health for select
  using (
    client_id in (select id from clients where portal_user_id = auth.uid())
  );

-- ── MONTHLY REPORTS ──
alter table monthly_reports enable row level security;

create policy "Owners manage reports"
  on monthly_reports for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Clients view own reports"
  on monthly_reports for select
  using (
    client_id in (select id from clients where portal_user_id = auth.uid())
  );

-- ── NOTES ──
alter table note_folders enable row level security;
alter table notes enable row level security;

create policy "Tenant access to note folders"
  on note_folders for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()) or tenant_id = get_my_tenant_id());

create policy "Tenant access to notes"
  on notes for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()) or tenant_id = get_my_tenant_id());

-- ── SOPs ──
alter table sops enable row level security;

create policy "Tenant access to SOPs"
  on sops for all
  using (tenant_id = (select id from tenants where owner_id = auth.uid()) or tenant_id = get_my_tenant_id());

-- ── SUPPORT TICKETS ──
alter table support_tickets enable row level security;

create policy "Users manage own tickets"
  on support_tickets for all
  using (user_id = auth.uid());

-- Super admin sees all tickets (handled via service role in API routes)

-- ── SUPPORT MESSAGES ──
alter table support_messages enable row level security;

create policy "Users view messages on own tickets"
  on support_messages for select
  using (
    ticket_id in (select id from support_tickets where user_id = auth.uid())
  );

create policy "Users send messages on own tickets"
  on support_messages for insert
  with check (
    sender_id = auth.uid()
    and ticket_id in (select id from support_tickets where user_id = auth.uid())
  );

-- ── ACTIVITY LOG ──
alter table activity_log enable row level security;

create policy "Owners view tenant activity"
  on activity_log for select
  using (tenant_id = (select id from tenants where owner_id = auth.uid()));

create policy "Members view tenant activity"
  on activity_log for select
  using (tenant_id = get_my_tenant_id());

create policy "System can insert activity"
  on activity_log for insert
  with check (tenant_id = (select id from tenants where owner_id = auth.uid()) or tenant_id = get_my_tenant_id());

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger tenants_updated_at before update on tenants for each row execute function update_updated_at();
create trigger clients_updated_at before update on clients for each row execute function update_updated_at();
create trigger freelancer_profiles_updated_at before update on freelancer_profiles for each row execute function update_updated_at();
create trigger projects_updated_at before update on projects for each row execute function update_updated_at();
create trigger tasks_updated_at before update on tasks for each row execute function update_updated_at();
create trigger client_requests_updated_at before update on client_requests for each row execute function update_updated_at();
create trigger site_health_updated_at before update on site_health for each row execute function update_updated_at();
create trigger monthly_reports_updated_at before update on monthly_reports for each row execute function update_updated_at();
create trigger notes_updated_at before update on notes for each row execute function update_updated_at();
create trigger sops_updated_at before update on sops for each row execute function update_updated_at();
create trigger support_tickets_updated_at before update on support_tickets for each row execute function update_updated_at();

-- ============================================================
-- TRIGGER: auto-create profile on auth signup
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'owner')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
