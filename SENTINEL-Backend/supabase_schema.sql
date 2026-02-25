create extension if not exists "uuid-ossp";

create table if not exists workspaces (
    id uuid primary key default uuid_generate_v4(),
    name text not null default 'My Workspace',
    timezone text not null default 'UTC',
    risk_confidence_threshold integer not null default 70,
    include_draft_prs boolean not null default false,
    notification_settings jsonb not null default '{"critical_risks": true, "daily_brief": true, "new_dependencies": false}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    name text not null,
    email text not null unique,
    password_hash text,
    initials text not null,
    avatar_gradient text not null default 'from-amber-400 to-orange-500',
    role text not null default 'member' check (role in ('admin', 'member', 'observer')),
    status text not null default 'active' check (status in ('active', 'pending')),
    graph_x float,
    graph_y float,
    created_at timestamptz not null default now()
);

create table if not exists commitments (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    owner_id uuid references users(id) on delete set null,
    description text not null,
    source text not null default 'slack' check (source in ('slack', 'email', 'meeting')),
    source_channel text not null default '',
    detected_at timestamptz not null default now(),
    due_date timestamptz not null,
    risk text not null default 'watch' check (risk in ('at-risk', 'watch', 'on-track')),
    dependency_count integer not null default 0,
    quote text not null default '',
    is_critical boolean not null default false,
    resolved boolean not null default false,
    created_at timestamptz not null default now(),
    unique (workspace_id, quote)
);

create table if not exists graph_edges (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    from_node_id uuid not null references users(id) on delete cascade,
    to_node_id uuid not null references users(id) on delete cascade,
    type text not null default 'normal' check (type in ('normal', 'blocked')),
    label text,
    commitment_id uuid references commitments(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists integrations (
    id text not null,
    workspace_id uuid not null references workspaces(id) on delete cascade,
    name text not null,
    icon text not null,
    status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'enterprise')),
    connected_account text,
    channels text[],
    last_synced_at text,
    description text not null default '',
    slack_bot_token text,
    gmail_access_token text,
    gmail_refresh_token text,
    github_access_token text,
    primary key (id, workspace_id)
);

create table if not exists notifications (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    title text not null,
    description text not null,
    type text not null default 'info' check (type in ('signal', 'risk', 'info')),
    unread boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists pipeline_runs (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    status text not null check (status in ('running', 'completed', 'failed')),
    execution_score integer,
    error text,
    started_at timestamptz not null default now(),
    completed_at timestamptz
);

insert into integrations (id, workspace_id, name, icon, status, description)
select
    integration_id,
    w.id,
    integration_name,
    integration_id,
    'disconnected',
    integration_desc
from workspaces w
cross join (values
    ('slack',            'Slack',              'Monitor Slack channels for commitment signals'),
    ('gmail',            'Gmail',              'Analyze email threads for commitments'),
    ('google-calendar',  'Google Calendar',    'Detect missed meetings and deadline conflicts'),
    ('notion',           'Notion',             'Connect shared Notion docs and project pages'),
    ('jira',             'Jira',               'Sync sprint issues and track delivery risk'),
    ('linear',           'Linear',             'Import Linear issues and cycle commitments'),
    ('microsoft',        'Microsoft Teams',    'Monitor Teams channels for commitments'),
    ('github',           'GitHub',             'Link pull requests and issues to commitments')
) as t(integration_id, integration_name, integration_desc)
on conflict (id, workspace_id) do nothing;
