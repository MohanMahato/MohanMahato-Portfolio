-- =====================================================================
-- Make YOUR account the (only) admin.
-- Run this ONCE in the Supabase SQL Editor, after you created your user in
-- Authentication -> Users. Replace the email below with YOUR email first.
-- =====================================================================

insert into public.admin_users (user_id)
select id
from auth.users
where email = 'YOUR_EMAIL_HERE'      -- <-- change this
on conflict (user_id) do nothing;

-- Check: this must show exactly ONE row with your email.
select u.email, a.created_at
from public.admin_users a
join auth.users u on u.id = a.user_id;
