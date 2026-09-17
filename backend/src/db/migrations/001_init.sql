-- 001_init — Identity + Org + RBAC (mytracker)
-- generated for feature/backend-auth-dashboard

create extension if not exists "pgcrypto";

-- organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  domain text,
  status text not null default 'active' check (status in ('active','suspended','archived')),
  plan text not null default 'growth',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index if not exists idx_org_slug on organizations (lower(slug)) where deleted_at is null;

-- users (mirror of auth.users)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  email text not null unique,
  first_name text,
  last_name text,
  display_name text,
  designation text,
  avatar_url text,
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_users_auth on users (auth_user_id);
create index if not exists idx_users_email on users (lower(email));

-- organization_memberships
create table if not exists organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','invited','suspended','left')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index if not exists idx_membership_org on organization_memberships (organization_id);
create index if not exists idx_membership_user on organization_memberships (user_id);

-- roles
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, key)
);
create index if not exists idx_roles_org_key on roles (organization_id, key);

-- permissions
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  module text not null,
  description text
);
create index if not exists idx_permissions_key on permissions (key);

-- role_permissions
create table if not exists role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- membership_roles
create table if not exists membership_roles (
  membership_id uuid not null references organization_memberships(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (membership_id, role_id)
);
create index if not exists idx_membership_roles_mem on membership_roles (membership_id);
create index if not exists idx_membership_roles_role on membership_roles (role_id);

-- audit_logs foundation
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  actor_id uuid references users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_org on audit_logs (organization_id, created_at desc);

-- RLS enable (defense in depth — service role bypasses)
alter table organizations enable row level security;
alter table users enable row level security;
alter table organization_memberships enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table membership_roles enable row level security;
alter table audit_logs enable row level security;

-- minimal policies: authenticated members can read their org data
-- Note: backend uses service_role so RLS is bypassed; policies are for defense if anon key used
do $$ begin
  if not exists (select 1 from pg_policies where policyname='allow_membership_read_own') then
    create policy allow_membership_read_own on organization_memberships for select using (user_id = auth.uid());
  end if;
end $$;
