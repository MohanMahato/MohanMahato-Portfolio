# Supabase Setup Guide (Beginner Friendly)

Is guide mein Supabase ka account banane se lekar database ready karne tak sab kuch step-by-step hai.
Tumhare paas pehle se Supabase project hona **zaroori nahi** hai. Sab free tier par hota hai.

> Supabase ka dashboard time ke saath thoda badalta rehta hai. Agar kisi button ka naam thoda alag dikhe,
> to usi jaise option dhundho. Kuch atak jaye to screenshot bhej dena.

---

## Step 1: Supabase account banao

1. https://supabase.com kholo, **Start your project** par click karo.
2. **Continue with GitHub** se login karo (tumhara GitHub account `MohanMahato` use ho sakta hai).

## Step 2: Naya project banao

1. **New project** par click karo.
2. Organization: jo default mile wahi rakho.
3. **Name:** `mohan-portfolio`
4. **Database Password:** ek strong password banao aur **kisi safe jagah save karo** (password manager ya notebook).
   Yeh password frontend, GitHub ya Vercel mein kabhi nahi daalna.
5. **Region:** tumhare liye sabse paas wala (jaise *South Asia (Mumbai)*).
6. **Plan:** Free.
7. **Create new project** dabao aur 1 to 2 minute wait karo, jab tak project "ready" na ho jaye.

## Step 3: Project URL aur Publishable key lo

1. Project kholo, upar **Connect** button ya left side mein **Project Settings** → **API Keys** par jao.
2. Yeh do cheezein copy karo:
   - **Project URL** (jaise `https://abcdefgh.supabase.co`)
   - **Publishable key** (`sb_publishable_...`)
3. Agar **Create new API keys** ka button dikhe to use dabao, phir publishable key copy karo.
   (Purane projects mein isi key ko **anon key** kehte hain. Woh bhi chalegi.)

**Bahut zaroori safety rule:**

| Key | Kahan use hogi |
|---|---|
| Publishable key (`sb_publishable_...`) / anon key | Frontend mein use karna **safe** hai |
| **Secret key (`sb_secret_...`) / `service_role` key** | **Kabhi frontend, `.env`, GitHub, Vercel (VITE_ variable) ya kisi ko share nahi karni** |

Secret key ke paas database ke saare security rules bypass karne ki power hoti hai.
Is project mein safety net bhi laga hai: agar tum galti se secret key kisi `VITE_` variable mein daalte ho,
to `npm run build` hi fail ho jayega.

## Step 4: `.env` file banao (Windows 11)

Project folder mein PowerShell kholo:

```powershell
copy .env.example .env
notepad .env
```

Notepad mein apni values paste karo aur save karo:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

`.env` file GitHub par upload nahi hoti (`.gitignore` ise rok deta hai).

## Step 5: Database tables banao (SQL migrations)

Migrations woh SQL files hain jo tables, security rules aur storage buckets banati hain.
Yeh `supabase/migrations/` folder mein hain aur inhe GitHub par rakhna chahiye.

**Sabse aasan tarika (ek hi paste):**

1. Supabase dashboard mein left side **SQL Editor** → **New query**.
2. Project ki file `supabase/all_in_one.sql` kholo, **poora** content copy karo aur editor mein paste karo.
3. **Run** dabao (ya `Ctrl + Enter`).
4. Agar Supabase warning dikhaye ki query mein "destructive operations" (jaise `drop policy`) hain, to **Run this query**
   dabao. Yeh sirf purani policies hataakar nayi lagata hai, tumhara koi data delete nahi hota.
5. Result: **Success. No rows returned.**

**Alternative:** `supabase/migrations/` ki 6 files ko number ke order mein (pehle `...000100`, last mein `...000600`)
ek ek karke run karo.

Yeh files **dobara run karna safe hai**, kuch toot-phoot nahi hogi.

## Step 6: Check karo ki sab bana ya nahi

- **Table Editor:** 18 tables dikhne chahiye (`profiles`, `academic_records`, `projects`, `skills`, ...).
- `academic_records` table mein **8 rows** (Semester 1 se Semester 8) honi chahiye. Sab khaali aur unpublished hain.
  Koi marks ya CGPA pehle se nahi bhara gaya, woh tum admin panel se bharoge.
- `profiles` mein 1 row (sirf tumhara naam), `website_settings` mein 1 row.
- Har table ke saath **RLS enabled** dikhna chahiye.
- Left side **Storage:** 5 buckets: `project-images`, `profile-photos`, `certificates`, `resumes` (sab public) aur `private-docs` (**private**).

## Step 7: Apna admin account banao

1. Left side **Authentication** → **Users** → **Add user** → **Create new user**.
2. Apni email aur strong password daalo. **Auto Confirm User** ka option tick karo.
3. **SQL Editor** → New query mein `supabase/manual/make_admin.sql` ka content paste karo.
4. `YOUR_EMAIL_HERE` ki jagah **wahi email** likho jo abhi banayi, phir Run karo.
5. Neeche result mein **exactly 1 row** dikhni chahiye (tumhari email ke saath). Wahi tumhara admin hai.

Admin banne ka tarika sirf yehi hai (SQL Editor). Website ya app se koi khud ko admin nahi bana sakta.

## Step 8: Public sign-up band karo

Abhi koi bhi aakar account bana sakta hai. Portfolio ke liye yeh nahi chahiye.

1. **Authentication** → **Sign In / Providers** (kuch versions mein *Configuration*).
2. **Allow new users to sign up** ko **OFF** karo aur **Save** dabao.

Pehle Step 7 karo, phir yeh step, taaki tumhara apna account ban chuka ho.
(Sign-up band hone par bhi, jo account pehle se hai woh login kar sakta hai.)

## Step 9: Security tests chalao

1. **SQL Editor** → New query → `supabase/tests/rls_verification.sql` paste karke Run karo.
2. Yeh temporary TEST data banata hai, jaanchta hai ki kaun kya dekh/badal sakta hai, aur end mein
   **sab kuch rollback** kar deta hai. Tumhara asli data change nahi hota.
3. Agar sab theek hai to bina red error ke complete hoga, aur kuch jagah `PASS: ...` messages dikh sakte hain.
   Kuch galat hua to red error aayega jisme `FAIL ...` likha hoga. Woh mujhe bhej dena.

## Step 10: App se connection test karo

```powershell
npm install
npm run dev
```

http://localhost:5173 kholo. Home page ke "Supabase connection" card mein
**Configured** aur **Database connected** (green) dikhna chahiye.

Red "Database error" aaye to message padho. Troubleshooting neeche hai.

## Step 11: GitHub par save karo

```powershell
git add .
git commit -m "Phase 3: database migrations and security"
git push
```

`.env` push nahi hoti. Migrations push hoti hain, aur yehi database ka "blueprint" hai.

---

## Database kaise bana hai (short)

Poori detail: [`DATABASE_ARCHITECTURE.md`](DATABASE_ARCHITECTURE.md)

| Group | Tables |
|---|---|
| Profile | `profiles` (1 row), `website_settings` (1 row) |
| Academics (8 semesters) | `academic_records` (semester 1 se 8, unique), `academic_subjects`, `academic_marksheets` (**admin only**) |
| Skills & learning | `skills`, `learning_timeline`, `research` |
| Work | `projects`, `project_images`, `internships`, `hackathons` |
| Proof | `certifications`, `coding_profiles`, `professional_links`, `achievements` |
| Future expansion | `custom_sections` |
| Security | `admin_users` |

- Har content table mein `is_published` (default **false**), `created_at`, `updated_at` (auto-update) hai.
- **Visitor:** sirf published content padh sakta hai. **Admin:** sab dekh aur badal sakta hai.
- Subjects tabhi dikhte hain jab subject aur uska academic record dono published hon.
- Phone number kahin store nahi hota. Marksheets sirf admin-only table aur private bucket mein rehti hain.
- Saare URLs `http://` ya `https://` se shuru hone chahiye (`javascript:` jaise khatarnak links reject hote hain).

## Troubleshooting

| Problem | Matlab / Fix |
|---|---|
| `relation "..." does not exist` | Migrations run nahi hui. Step 5 dobara karo |
| Home page par "Not configured" | `.env` nahi bani ya naam galat hai. `npm run dev` restart karo |
| "Connected, but no data found" | Migration 6 (seed) nahi chali. `all_in_one.sql` dobara run karo |
| `permission denied for table ...` | Migration 4 (RLS/grants) nahi chali ya adhoori chali. Dobara run karo |
| `Invalid API key` | Key galat copy hui. Publishable key dobara copy karo |
| Build fail: "UNSAFE ENVIRONMENT VARIABLES" | Tumne secret key `VITE_` variable mein daali. Hata do aur publishable key lagao |
| Free project "paused" ho gaya | Kuch din inactivity par hota hai. Dashboard se **Restore** karo (Phase 8 mein keep-alive lagayenge) |

## Safety checklist

- [ ] Database password safe jagah save hai
- [ ] `.env` GitHub par nahi hai
- [ ] Secret / `service_role` key kahin paste nahi hui
- [ ] Sab 18 tables par RLS enabled hai (Table Editor mein dekho)
- [ ] Public sign-up band hai
- [ ] `make_admin.sql` chalane ke baad admin_users mein sirf 1 row hai
- [ ] `private-docs` bucket **private** hai, baaki 4 public
