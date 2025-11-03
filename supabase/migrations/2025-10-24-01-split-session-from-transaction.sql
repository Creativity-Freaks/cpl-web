-- Migration: split session tokens from combined `transaction_id` values into the `session` column
-- Date: 2025-10-24

-- 1) Backup current profiles table (idempotent)
create table if not exists public.profiles_backup as
select * from public.profiles where false;

insert into public.profiles_backup
select * from public.profiles p
where not exists (select 1 from public.profiles_backup b where b.id = p.id);

-- 2) Preview rows where transaction_id looks like it contains a session token
select id, email, transaction_id
from public.profiles
where transaction_id is not null
  and (transaction_id ~ '\\d{4}[-/]\\d{2,4}' or transaction_id ~ 'session' or transaction_id ~ '\\b20\\d{2}');

-- 3) Example UPDATE (commented out): extract a session-like token and move it into `session`.
-- The update below attempts to extract the first occurrence of a pattern like 2024-25 or 2024/25 from transaction_id.
-- It will set session to the extracted token and remove it from transaction_id. Run a SELECT (above) and inspect before using.

-- with extracted as (
--   select id,
--     regexp_matches(transaction_id, '(20\\d{2}[-/][0-9]{2,4})') as m,
--     transaction_id as old_tid
--   from public.profiles
--   where transaction_id is not null
-- )
-- update public.profiles p
-- set session = m[1],
--     transaction_id = trim(replace(old_tid, m[1], ' '))
-- from extracted
-- where p.id = extracted.id
--   and m is not null;

-- 4) Alternative safe approach: if transaction_id contains '::' delimiter like 'TXN123::2024-25', split on that delimiter.
-- Uncomment & run only if your data uses this delimiter pattern.

-- update public.profiles
-- set session = split_part(transaction_id, '::', 2),
--     transaction_id = split_part(transaction_id, '::', 1)
-- where transaction_id like '%::%';

-- 5) Post-update: verify
-- select id, email, transaction_id, session from public.profiles where id in (select id from public.profiles_backup);

-- Notes:
-- - This migration is deliberately non-destructive: it copies rows to profiles_backup first.
-- - Review the SELECT preview results carefully to ensure the regex matches your real session tokens.
-- - If your legacy transaction_id uses a different pattern, edit the regex or use the delimiter approach.
