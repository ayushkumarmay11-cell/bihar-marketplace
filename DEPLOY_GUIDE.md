# 🚀 Bihar Marketplace — Step-by-Step Deploy Guide

## Architecture Overview

```
BiharBazaar
├── client/   → React.js + Vite → deployed to Vercel
├── server/   → Node.js + Express → deployed to Vercel
└── Supabase  → Database + Auth + Storage (cloud)
```

---

## STEP 1 — Set Up Supabase

### 1.1 Create Account & Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Fill in:
   - **Name**: `bihar-marketplace`
   - **Database Password**: (save this!)
   - **Region**: Southeast Asia (Singapore) — closest to India
4. Wait ~2 minutes for the project to provision

### 1.2 Run the Database Schema
1. In Supabase dashboard → click **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `supabase_schema.sql`
4. Click **Run** ▶️
5. You should see "Success. No rows returned"

### 1.3 Set Up Storage Bucket
1. Go to **Storage** in the sidebar
2. Click **New bucket**
3. Name: `item-images`
4. Toggle **Public bucket** → ON
5. Click **Save**

### 1.4 Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy these three values:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

---

## STEP 2 — Set Up & Run Locally

### 2.1 Server Setup

```bash
cd server
cp .env.example .env
```

Edit `.env` and fill in:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=any_random_long_string_here_change_this
PORT=5000
CLIENT_URL=http://localhost:5173
```

Install dependencies and start:
```bash
npm install
npm run dev
```

Server will run at: `http://localhost:5000`
Test it: Open `http://localhost:5000` — you should see the welcome JSON response.

### 2.2 Client Setup

```bash
cd client
cp .env.example .env.local
```

Edit `.env.local` and fill in:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5000
```

Install dependencies and start:
```bash
npm install
npm run dev
```

Client will run at: `http://localhost:5173` 🎉

---

## STEP 3 — Deploy Backend to Vercel

### 3.1 Push to GitHub
```bash
cd /path/to/bihar-marketplace

# Initialize git (from root folder)
git init
git add .
git commit -m "Initial commit: Bihar Marketplace"
git branch -M main

# Create a new repo on github.com and push:
git remote add origin https://github.com/YOUR_USERNAME/bihar-marketplace.git
git push -u origin main
```

### 3.2 Deploy Server on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. When asked for the **Root Directory** → type `server`
4. Framework Preset → **Other** (not Next.js)
5. Click **Environment Variables** and add:
   ```
   SUPABASE_URL = your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
   SUPABASE_ANON_KEY = your_anon_key
   JWT_SECRET = your_jwt_secret
   CLIENT_URL = https://your-frontend-domain.vercel.app
   ```
6. Click **Deploy**
7. Note the deployment URL: e.g. `https://bihar-marketplace-server.vercel.app`

### 3.3 Test the Backend API
Visit: `https://your-server-url.vercel.app/`
You should see: `{"message":"Bihar Marketplace API is running 🚀","version":"1.0.0"}`

---

## STEP 4 — Deploy Frontend to Vercel

### 4.1 Deploy Client on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the same GitHub repository
3. Root Directory → `client`
4. Framework Preset → **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add Environment Variables:
   ```
   VITE_SUPABASE_URL = your_supabase_project_url
   VITE_SUPABASE_ANON_KEY = your_anon_key
   VITE_API_URL = https://bihar-marketplace-server.vercel.app
   ```
8. Click **Deploy**
9. Your frontend URL: e.g. `https://bihar-marketplace.vercel.app`

### 4.2 Update Backend CORS
Go to your **server** Vercel project → Settings → Environment Variables
Update `CLIENT_URL` to your frontend Vercel URL → Redeploy

---

## STEP 5 — Final Checks

### ✅ Test Checklist
- [ ] Visit frontend URL → Homepage loads with no errors
- [ ] Register a new account → Works
- [ ] Login → Works
- [ ] Post a new item → Item appears on homepage
- [ ] View item detail → Seller contact button works
- [ ] Mark item as sold → Status updates
- [ ] Delete item → Removed from listings

### 🔗 Your Live URLs
| Service | URL |
|---|---|
| Frontend | `https://bihar-marketplace.vercel.app` |
| Backend API | `https://bihar-marketplace-server.vercel.app` |
| Supabase | `https://app.supabase.com/project/your-project` |

---

## 🛠️ Local Development Commands

```bash
# Start backend server
cd server && npm run dev

# Start frontend client
cd client && npm run dev

# Build frontend for production
cd client && npm run build
```

---

## 📁 Project File Reference

```
bihar-marketplace/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── lib/
│   │   │   ├── api.js           # Axios client with auth
│   │   │   └── supabase.js      # Supabase client
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Browse listings
│   │   │   ├── Register.jsx     # Create account
│   │   │   ├── Login.jsx        # Sign in
│   │   │   ├── Dashboard.jsx    # Manage my listings
│   │   │   ├── ListItem.jsx     # Post new item
│   │   │   └── ItemDetail.jsx   # View single item
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   └── Footer.jsx
│   │   └── styles/              # Component CSS files
│   └── vercel.json
│
├── server/                      # Node.js Backend
│   ├── routes/
│   │   ├── auth.js              # Register, Login, /me
│   │   ├── items.js             # CRUD item listings
│   │   └── users.js             # User profiles
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── lib/
│   │   └── supabaseClient.js    # Supabase admin client
│   ├── index.js                 # Express server entry
│   └── vercel.json
│
└── supabase_schema.sql          # Database schema + RLS policies
```

---

## 🔒 Security Notes

- ⚠️ **NEVER** commit `.env` or `.env.local` files to GitHub (add them to `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` gives full database access — keep it server-side only
- JWT tokens expire after 7 days — users need to re-login
- The frontend uses only the `SUPABASE_ANON_KEY` (safe to expose)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---|---|
| API 401 Unauthorized | Check JWT_SECRET matches between server and token generation |
| CORS errors | Ensure CLIENT_URL env var matches your frontend URL exactly |
| Supabase connection error | Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY |
| Images not uploading | Check "item-images" bucket exists and is public in Supabase |
| Items not showing | Check RLS policies were applied (run supabase_schema.sql) |
