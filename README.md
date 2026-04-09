# 🌿 Habitual — MERN Habit Tracker

A beautiful, mobile-first habit tracking app built with MongoDB Atlas, Express, React, and Node.js.

---

## 📁 Project Structure

```
habit-tracker-project/
├── backend/                  ← Node/Express API
│   ├── models/
│   │   ├── User.js           ← User schema (name, email, hashed password)
│   │   ├── Habit.js          ← Habit schema (userId, name, emoji, color, targetDays)
│   │   └── HabitLog.js       ← Log schema (userId, habitId, date, completed)
│   ├── routes/
│   │   ├── auth.js           ← POST /register, POST /login, GET /me
│   │   ├── habits.js         ← CRUD for habits
│   │   └── logs.js           ← Toggle logs, GET /stats (analytics)
│   ├── middleware/
│   │   └── auth.js           ← JWT verification middleware
│   ├── server.js             ← Express app + MongoDB connection
│   ├── .env.example          ← Environment variables template
│   └── package.json
│
└── frontend/                 ← React + Vite + Tailwind
    ├── src/
    │   ├── api/client.js     ← Axios instance with JWT interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx  ← Global auth state (user, login, logout)
    │   ├── pages/
    │   │   ├── Auth.jsx         ← Login / Sign up (split panel)
    │   │   ├── Dashboard.jsx    ← Today view — one-tap habit check-in
    │   │   ├── WeeklyView.jsx   ← Bullet journal grid — Mon to Sun
    │   │   ├── MonthlyGrid.jsx  ← Full month checkbox grid with stats
    │   │   ├── Analytics.jsx    ← Charts: heatmap, bar, line, pie
    │   │   └── ManageHabits.jsx ← Add / Edit / Delete habits
    │   ├── components/
    │   │   ├── Layout.jsx        ← Bottom nav + top header
    │   │   └── AddHabitModal.jsx ← Emoji/color picker, target days
    │   ├── App.jsx              ← Router + ProtectedRoute
    │   ├── main.jsx
    │   └── index.css            ← Design system (CSS vars, animations)
    ├── tailwind.config.js
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Setup Guide

### Step 1 — MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free cluster
2. Under **Database Access**, create a user with Read/Write access
3. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) for development
4. Click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Replace `<username>` and `<password>` with your credentials

---

### Step 2 — Backend Setup

```bash
# Navigate into your project folder
cd habit-tracker-project/backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/habittracker?retryWrites=true&w=majority
JWT_SECRET=choose_any_long_random_string_here_make_it_complex
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
# Start backend (dev mode with auto-reload)
npm run dev

# You should see:
# ✅ MongoDB Atlas connected
# 🚀 Server running on port 5000
```

---

### Step 3 — Frontend Setup

```bash
cd ../frontend

# Install dependencies (removes supabase, adds axios)
npm install

# Create your .env file
cp .env.example .env
```

`.env` content (default works as-is with the proxy in vite.config.js):
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend dev server
npm run dev

# App runs at http://localhost:5173
```

---

### Step 4 — Replace Your Existing Frontend Files

Your existing `habit-tracker/` folder has a working Vite/React/Tailwind setup. 
Copy these files over:

| Copy from `frontend/`          | To your `habit-tracker/`          |
|-------------------------------|-----------------------------------|
| `src/` (entire folder)        | Replace your `src/`               |
| `vite.config.js`              | Replace your `vite.config.js`     |
| `tailwind.config.js`          | Replace your `tailwind.config.js` |
| `postcss.config.js`           | Replace (same content)            |
| `package.json`                | Replace (removes supabase)        |
| `.env.example` → `.env`       | Create `.env`                     |

Then run `npm install` again to remove Supabase and add Axios.

---

## 🎨 App Pages

| Route          | Page           | Description                                      |
|----------------|----------------|--------------------------------------------------|
| `/`            | Auth           | Login / Sign up                                  |
| `/dashboard`   | Today          | Daily check-in cards, progress ring, streaks     |
| `/weekly`      | Weekly Grid    | Mon–Sun grid, per-habit progress bars            |
| `/monthly`     | Monthly Grid   | Full month checkbox grid (like the Excel sheet!) |
| `/analytics`   | Analytics      | Heatmap, bar chart, line chart, pie chart        |
| `/habits`      | Manage Habits  | Add / edit / delete habits with emoji + colors   |

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register   { name, email, password }
POST   /api/auth/login      { email, password }
GET    /api/auth/me         (Bearer token required)
```

### Habits
```
GET    /api/habits          List all active habits
POST   /api/habits          Create habit
PUT    /api/habits/:id      Update habit
DELETE /api/habits/:id      Soft delete habit
```

### Logs
```
GET    /api/logs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD    Get logs in range
POST   /api/logs            Toggle completion { habitId, date, completed }
GET    /api/logs/stats      Analytics: streak, completion %, charts data
```

---

## 📦 Deploy (Optional)

### Backend → Railway or Render
1. Push `backend/` to GitHub
2. Connect to [Railway](https://railway.app) or [Render](https://render.com)
3. Add environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL)
4. Deploy — get your API URL

### Frontend → Vercel or Netlify
1. Push `frontend/` to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set `VITE_API_URL=https://your-backend-url.railway.app/api`
4. Deploy

---

## ✅ Feature Checklist

- [x] JWT auth — each user sees only their own habits & logs
- [x] One-tap check-in from Dashboard with optimistic updates
- [x] Weekly grid — bullet journal style
- [x] Monthly grid — full checkbox grid with per-habit % and daily totals
- [x] Analytics — heatmap, bar chart, line chart, pie chart, per-habit stats
- [x] Add/edit/delete habits with emoji, color, and target day selection
- [x] Progress ring, streak flame, best streak, total completions
- [x] Mobile-first responsive design with bottom navigation
- [x] Smooth animations and transitions throughout
- [x] Loading skeletons while data fetches

---

## 🔮 Next Steps (Ideas)

- [ ] Push notifications / reminders (PWA + Web Push API)
- [ ] Avatar upload via Cloudinary  
- [ ] Habit categories / tags
- [ ] Notes on individual completions
- [ ] Export data as CSV
- [ ] Dark mode toggle
- [ ] Social / accountability partner feature
