-- 20260917160035_project_foundation — Projects + SubProjects + Teams + Memberships
-- Builds on 20260917121452_initial_identity_rbac.sql

create extension if not exists "pgcrypto";

-- ── Projects ───────────────────────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','planned','completed','archived','on_hold')),
  health text not null default 'healthy' check (health in ('healthy','on_track','at_risk','critical')),
  progress int not null default 0 check (progress >=0 and progress <=100),
  type text check (type in ('platform','product','client_delivery','internal','data','design')),
  business_analyst_id uuid references users(id) on delete set null,
  client text,
  start_date date,
  end_date date,
  budget numeric(14,2) not null default 0 check (budget >=0),
  spent numeric(14,2) not null default 0 check (spent >=0),
  tags text[] not null default '{}',
  has_sub_projects boolean not null default false,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint chk_project_dates check (end_date is null or start_date is null or end_date >= start_date)
);
create unique index if not exists idx_projects_org_key on projects (organization_id, lower(key)) where deleted_at is null;
create index if not exists idx_projects_org on projects (organization_id) where deleted_at is null;
create index if not exists idx_projects_org_status on projects (organization_id, status) where deleted_at is null;
create index if not exists idx_projects_deleted on projects (deleted_at);

-- ── Sub Projects ───────────────────────────────────────────────────────────
create table if not exists sub_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','planned','completed','archived','on_hold')),
  health text not null default 'healthy' check (health in ('healthy','on_track','at_risk','critical')),
  progress int not null default 0 check (progress >=0 and progress <=100),
  business_analyst_id uuid references users(id) on delete set null,
  start_date date,
  end_date date,
  budget numeric(14,2) not null default 0 check (budget >=0),
  spent numeric(14,2) not null default 0 check (spent >=0),
  tags text[] not null default '{}',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint chk_sub_project_dates check (end_date is null or start_date is null or end_date >= start_date)
);
create unique index if not exists idx_sub_projects_project_key on sub_projects (project_id, lower(key)) where deleted_at is null;
create index if not exists idx_sub_projects_org on sub_projects (organization_id) where deleted_at is null;
create index if not exists idx_sub_projects_project on sub_projects (project_id) where deleted_at is null;

-- ── Teams ──────────────────────────────────────────────────────────────────
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  type text not null default 'cross_functional' check (type in ('development','qa','design','business_analysis','devops','cross_functional')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index if not exists idx_teams_org_name on teams (organization_id, lower(name)) where deleted_at is null;
create index if not exists idx_teams_org on teams (organization_id) where deleted_at is null;

-- ── Project Managers (M:N, multiple managers per project) ───────────────────
create table if not exists project_managers (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references users(id) on delete set null,
  primary key (project_id, user_id)
);
create index if not exists idx_project_managers_user on project_managers (user_id);
create index if not exists idx_project_managers_project on project_managers (project_id);

-- ── Project Members ─────────────────────────────────────────────────────────
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'developer' check (role in ('owner','manager','lead','developer','qa','designer','business_analyst','consultant')),
  capacity int not null default 100 check (capacity >=0 and capacity <=100),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chk_member_dates check (ended_at is null or ended_at >= started_at)
);
create index if not exists idx_project_members_org on project_members (organization_id);
create index if not exists idx_project_members_project on project_members (project_id) where ended_at is null;
create index if not exists idx_project_members_user on project_members (user_id) where ended_at is null;
create index if not exists idx_project_members_project_user on project_members (project_id, user_id) where ended_at is null;

-- ── Sub-Project Members ──────────────────────────────────────────────────────
create table if not exists sub_project_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  sub_project_id uuid not null references sub_projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'developer' check (role in ('owner','manager','lead','developer','qa','designer','business_analyst','consultant')),
  capacity int not null default 100 check (capacity >=0 and capacity <=100),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chk_sub_member_dates check (ended_at is null or ended_at >= started_at)
);
create index if not exists idx_sub_project_members_org on sub_project_members (organization_id);
create index if not exists idx_sub_project_members_sub on sub_project_members (sub_project_id) where ended_at is null;
create index if not exists idx_sub_project_members_user on sub_project_members (user_id) where ended_at is null;

-- ── Team Members ─────────────────────────────────────────────────────────────
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role_override text check (role_override in ('lead','member')),
  capacity int not null default 100 check (capacity >=0 and capacity <=100),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chk_team_member_dates check (left_at is null or left_at >= joined_at)
);
create unique index if not exists idx_team_members_team_user_active on team_members (team_id, user_id) where left_at is null;
create index if not exists idx_team_members_org on team_members (organization_id);
create index if not exists idx_team_members_team on team_members (team_id) where left_at is null;
create index if not exists idx_team_members_user on team_members (user_id) where left_at is null;

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table projects enable row level security;
alter table sub_projects enable row level security;
alter table teams enable row level security;
alter table project_managers enable row level security;
alter table project_members enable row level security;
alter table sub_project_members enable row level security;
alter table team_members enable row level security;

-- Policies: org members can read their org data; service_role bypasses for backend
do $$ begin
  if not exists (select 1 from pg_policies where policyname='allow_projects_org_member') then
    create policy allow_projects_org_member on projects for all using (
      organization_id in (select organization_id from organization_memberships where user_id = auth.uid() and status='active')
    );
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_sub_projects_org_member') then
    create policy allow_sub_projects_org_member on sub_projects for all using (
      organization_id in (select organization_id from organization_memberships where user_id = auth.uid() and status='active')
    );
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_teams_org_member') then
    create policy allow_teams_org_member on teams for all using (
      organization_id in (select organization_id from organization_memberships where user_id = auth.uid() and status='active')
    );
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_project_managers_org_member') then
    create policy allow_project_managers_org_member on project_managers for all using (
      project_id in (select id from projects where organization_id in (select organization_id from organization_memberships where user_id = auth.uid() and status='active'))
    );
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_project_members_org_member') then
    create policy allow_project_members_org_member on project_members for all using (
      organization_id in (select organization_id from organization_memberships where user_id = auth.uid() and status='active')
    );
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_sub_project_members_org_member') then
    create policy allow_sub_project_members_org_member on sub_project_members for all using (
      organization_id in (select organization_id from organization_memberships where user_id = auth.uid() and status='active')
    );
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_team_members_org_member') then
    create policy allow_team_members_org_member on team_members for all using (
      organization_id in (select organization_id from organization_memberships where user_id = auth.uid() and status='active')
    );
  end if;
end $$;

-- ── Updated_at trigger ─────────────────────────────────────────────────────
create or replace function update_updated_at_column() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at before update on projects for each row execute function update_updated_at_column();
drop trigger if exists trg_sub_projects_updated_at on sub_projects;
create trigger trg_sub_projects_updated_at before update on sub_projects for each row execute function update_updated_at_column();
drop trigger if exists trg_teams_updated_at on teams;
create trigger trg_teams_updated_at before update on teams for each row execute function update_updated_at_column();
