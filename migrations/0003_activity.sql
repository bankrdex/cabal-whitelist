-- Freeze Base activity (tx nonce + NFT balance) on first successful check

alter table allocations
  add column if not exists activity_synced_at timestamptz;
