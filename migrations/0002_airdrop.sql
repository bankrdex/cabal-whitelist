-- CABAL airdrop allocations, claims, binds, settings, admin log

create table if not exists allocations (
  wallet text primary key,
  transaction_count integer not null,
  nft_count integer not null,
  transaction_allocation bigint not null,
  nft_allocation bigint not null,
  total_allocation bigint not null,
  merkle_leaf text,
  claimed boolean not null default false,
  claim_transaction text,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists allocations_claimed_idx on allocations (claimed);

create table if not exists user_binds (
  privy_user_id text primary key,
  allocation_wallet text not null,
  embedded_wallet text,
  created_at timestamptz not null default now()
);

create unique index if not exists user_binds_allocation_wallet_idx on user_binds (allocation_wallet);

create table if not exists claim_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into claim_settings (key, value)
values
  ('claim_start', '2026-09-08T12:00:00+01:00'),
  ('paused', 'false'),
  ('merkle_root', '')
on conflict (key) do nothing;

create table if not exists admin_actions (
  id serial primary key,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
