-- Seed: Acme Technologies + Alex Morgan Super Admin
-- Run with service_role

-- organization
insert into organizations (id, name, slug, domain, plan)
values ('00000000-0000-4000-a000-000000000001','Acme Technologies','acme-technologies','acme.com','enterprise')
on conflict (id) do nothing;

-- permissions catalog (stable codes matching FE PermissionKey)
insert into permissions (key, label, module) values
('dashboard.view','Dashboard','dashboard'),
('my_work.view','My Work','work'),
('projects.view','Projects view','project'),
('projects.create','Projects create','project'),
('timesheet.view','Timesheet view','timesheet'),
('timesheets.view_all','Timesheets view all','timesheet'),
('timesheet.approve','Timesheet approve','timesheet'),
('attendance.view','Attendance view','hr'),
('leave.view','Leave view','hr'),
('hr.view','HR view','hr'),
('monitoring.view','Monitoring view','monitoring'),
('reports.view','Reports view','report'),
('ai.view','AI view','ai'),
('survey.view','Survey view','survey'),
('notifications.view','Notifications view','notification'),
('documents.view','Documents view','document'),
('administration.view','Administration view','admin'),
('admin.all','Admin wildcard','admin')
on conflict (key) do nothing;

-- system roles (organization_id null)
insert into roles (id, organization_id, key, name, is_system) values
('00000000-0000-4000-a000-000000001001', null, 'super_admin','Super Admin', true),
('00000000-0000-4000-a000-000000001002', null, 'employee','Employee', true),
('00000000-0000-4000-a000-000000001003', null, 'team_lead','Team Lead', true),
('00000000-0000-4000-a000-000000001004', null, 'project_manager','Project Manager', true),
('00000000-0000-4000-a000-000000001005', null, 'hr_admin','HR Admin', true),
('00000000-0000-4000-a000-000000001006', null, 'executive','Executive', true)
on conflict (id) do nothing;

-- super_admin gets admin.all
insert into role_permissions (role_id, permission_id)
select '00000000-0000-4000-a000-000000001001'::uuid, id from permissions where key='admin.all'
on conflict do nothing;

-- users are created via Supabase Auth trigger or manual insert — demo user placeholder
-- Note: auth_user_id must match real auth.users.id when Supabase is used
-- For mock mode, backend does not require this row; /auth/me synthetic response is used
