# 🌿 Habitual — MERN Habit Tracker

> A beautiful, mobile-first habit tracking app with AI coaching, weather-aware UI, offline sync, 17 themes, and full analytics. Built with MongoDB Atlas, Express, React, and Node.js.

---

## 📸 What This App Does

Habitual is a full-featured personal wellness and habit tracking app. It lets you build and track daily habits, visualize your progress with rich charts, get personalized AI-powered coaching based on your health profile, and adapts its UI to your local weather and season in real time.

---

## 🗂️ Full Project Structure

```
FunProject/
├── backend/
│   ├── middleware/
│   │   └── auth.js               ← JWT verification middleware
│   ├── models/
│   │   ├── User.js               ← Extended user schema with health profile
│   │   ├── Habit.js              ← Habit schema (emoji, color, targetDays, order)
│   │   └── HabitLog.js           ← Log schema (habitId, date, completed, note)
│   ├── routes/
│   │   ├── auth.js               ← Register, login, profile, about, password, data
│   │   ├── habits.js             ← CRUD + drag-to-reorder endpoint
│   │   ├── logs.js               ← Toggle logs, stats, streaks
│   │   └── ai.js                 ← AI chat, daily tips, food recommendations
│   ├── .env                      ← ⚠️ NEVER COMMIT — secrets live here
│   ├── .env.example              ← Safe template to share
│   ├── server.js                 ← Express app + MongoDB connection
│   ├── seed.js                   ← Sample data seeder
│   └── package.json
│
└── frontend/
    ├── public/
    │   ├── manifest.json         ← PWA manifest
    │   └── sw.js                 ← Service worker (offline support)
    ├── src/
    │   ├── api/
    │   │   ├── client.js         ← Axios instance + offline queue + JWT interceptor
    │   │   └── weather.js        ← OpenWeatherMap helpers + recommendations
    │   ├── components/
    │   │   ├── AddHabitModal.jsx  ← Emoji/color picker, target day selector
    │   │   ├── InstallPrompt.jsx  ← PWA install banner (Android + iOS)
    │   │   ├── Layout.jsx         ← Header, bottom nav, season particles
    │   │   ├── NoteModal.jsx      ← Long-press note on habit completions
    │   │   ├── Onboarding.jsx     ← First-run 4-step walkthrough
    │   │   ├── SyncBanner.jsx     ← Offline status + manual sync button
    │   │   └── WeatherEffects.jsx ← Canvas rain, snow, fog, storm, stars
    │   ├── context/
    │   │   ├── AuthContext.jsx    ← Global auth state
    │   │   ├── ThemeContext.jsx   ← 17 themes, 10 fonts, season detection
    │   │   └── WeatherContext.jsx ← Live weather via GPS or IP fallback
    │   ├── pages/
    │   │   ├── About.jsx          ← 6-step user health profile wizard
    │   │   ├── AIChat.jsx         ← AI coach chat (voice in/out, daily tips)
    │   │   ├── Analytics.jsx      ← Day/Week/Month/Year tabs, 8 chart types
    │   │   ├── Auth.jsx           ← Login / Sign up split panel
    │   │   ├── Dashboard.jsx      ← Today view, progress ring, weather card
    │   │   ├── ManageHabits.jsx   ← Add/Edit/Delete + drag-to-reorder
    │   │   ├── MonthlyGrid.jsx    ← Full month checkbox grid
    │   │   ├── Profile.jsx        ← Theme gallery, font picker, sync, password
    │   │   └── WeeklyView.jsx     ← Mon–Sun bullet journal grid
    │   ├── utils/
    │   │   └── offlineQueue.js    ← IndexedDB queue for offline writes
    │   ├── App.jsx                ← Router + provider tree
    │   ├── index.css              ← Design system, animations, theme CSS vars
    │   └── main.jsx
    ├── .env                       ← ⚠️ NEVER COMMIT — API keys live here
    ├── .env.example               ← Safe template
    ├── index.html                 ← PWA meta tags, service worker registration
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup Guide

### Prerequisites

- Node.js 18+ and npm
- A free MongoDB Atlas account
- A free Groq API key (for AI features)
- A free OpenWeatherMap API key (for weather features)

---

### Step 1 — MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a **free cluster** (M0 tier)
2. Under **Database Access** → Add database user → set username and password
3. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allows all IPs for dev)
4. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Replace `<username>` and `<password>` with what you set in step 2

---

### Step 2 — Get Free API Keys

#### Groq API Key (AI Chat) — Free, no credit card
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with Google or email
3. Go to **API Keys** → **Create API Key**
4. Copy the key — looks like `gsk_xxxxxxxxxxxx`

#### OpenWeatherMap Key (Weather) — Free 1000 calls/day
1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to **API Keys** in your dashboard
4. Copy the default key (or create a new one) — looks like `512517e8c0765b...`
5. ⚠️ New keys take up to 10 minutes to activate

---

### Step 3 — Backend Setup

```bash
# Navigate to backend folder
cd FunProject/backend

# Install dependencies
npm install

# Copy the example env file
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/habittracker?retryWrites=true&w=majority
JWT_SECRET=pick_any_long_random_string_min_32_chars_like_this_abc123xyz
PORT=5000
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=gsk_your_groq_key_here
```

```bash
# Start the backend in dev mode
npm run dev

# You should see:
# ✅ MongoDB Atlas connected
# 🚀 Server running on port 5000
```

---

### Step 4 — Frontend Setup

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Copy the example env file
cp .env.example .env
```

Open `frontend/.env` and fill in your values:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WEATHER_KEY=your_openweathermap_key_here
```

```bash
# Start the frontend dev server
npm run dev

# App runs at http://localhost:5173
```

Open your browser and go to `http://localhost:5173` — register a new account and you're in.

---

### Step 5 — (Optional) Seed Sample Data

If you want to see charts and analytics populated with demo data:

```bash
cd backend

# Open seed.js and change TARGET_EMAIL to your registered email
# Then run:
node seed.js

# To clear seeded data:
node seed.js --clear
```

---

## 🔐 Environment Variables Reference

### Backend — `backend/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for signing tokens — make it long and random | ✅ Yes |
| `PORT` | Backend port (default 5000) | Optional |
| `CLIENT_URL` | Frontend URL for CORS (default http://localhost:5173) | Optional |
| `GROQ_API_KEY` | Groq API key for AI features — get free at console.groq.com | For AI |

### Frontend — `frontend/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | ✅ Yes |
| `VITE_WEATHER_KEY` | OpenWeatherMap API key — free at openweathermap.org | For weather |

### ⚠️ Security Rules — Read This

- **Never commit `.env` files** to Git. They are already in `.gitignore`.
- **Never share your `JWT_SECRET`** — anyone with it can forge login tokens.
- **Never share your `MONGO_URI`** — it contains your database username and password.
- When deploying, set these as environment variables in your hosting platform (Railway, Render, Vercel) — never hardcode them in source files.
- Rotate your keys immediately if you accidentally expose them.

---

## 🎨 Pages and Features

| Route | Page | What it does |
|-------|------|--------------|
| `/` | Auth | Login and sign up with animated split panel |
| `/dashboard` | Today | Daily habit check-in, progress ring, weather recommendation card, streaks |
| `/weekly` | Weekly Grid | Mon–Sun bullet journal style grid with streak indicators |
| `/monthly` | Monthly Grid | Full month checkbox grid, per-habit %, day totals |
| `/analytics` | Analytics | Day/Week/Month/Year tabs with 8 different chart types |
| `/habits` | Manage Habits | Add/edit/delete habits, drag to reorder, emoji + color picker |
| `/ai` | AI Coach | Chat with Groq AI, voice input/output, daily tips, food recommendations |
| `/about` | About You | 6-step health profile wizard used by the AI to personalize responses |
| `/profile` | Profile | Theme gallery, font picker, offline sync, change password, danger zone |

---

## 🤖 AI Coach Features

The AI coach is powered by **Groq** (free tier, Llama 3 model) and has full context of:

- Your name, age, gender, city
- Your diet type (vegetarian, non-veg, vegan, jain, keto, etc.)
- Your occupation (student, working professional, freelancer, etc.)
- Your fitness level and health goals
- Your allergies and intolerances
- Your water and sleep goals, weight and height
- All your active habits and their 7-day completion rates
- Current weather and season (passed at query time)

**What you can ask:**
- Food and meal recommendations for any time of day
- Workout suggestions based on your fitness level
- Sleep improvement tips
- Habit prioritization advice
- Hydration and energy tips
- Seasonal wellness advice (what to eat in summer, winter immunity, etc.)

**Voice features:**
- 🎤 **Voice input** — tap the mic button and speak your question
- 🔊 **Text-to-speech** — tap the speaker button to hear the AI's last reply read aloud

**Daily Tips** load automatically when you open the AI page — 3 personalized tips generated fresh each day based on your profile and current weather.

---

## 🌤️ Weather System

The app auto-detects your location and fetches live weather, which drives:

**Visual weather effects:**
- 🌧️ Rain — animated canvas raindrops
- ❄️ Snow — floating canvas snowflakes
- 🌫️ Fog — drifting overlay
- ⛈️ Storm — heavy rain + lightning flashes
- ☀️ Sunny — warm shimmer overlay
- 🌙 Night — twinkling star field
- 🧊 Cold — frost crystal SVGs in corners

**UI changes:**
- Live temperature chip in the header (color-coded by comfort level)
- Weather recommendation card on Dashboard with habit suggestions
- Weather context passed to AI for smarter advice

**Location detection order:** GPS → IP-based fallback → Default city. Weather is cached for 30 minutes in localStorage.

---

## 🎨 Themes and Customization

### 17 Themes

| Theme | Style | Best For |
|-------|-------|----------|
| 🌿 Forest | Soft green light | Default everyday |
| 🌲 Forest Dark | Deep green dark | Night use |
| 🌸 Spring | Pink blossom + falling petals | March–May |
| ☀️ Summer | Warm amber + gradient bar | June–July |
| 🍂 Autumn | Brown/orange + falling leaves | November |
| ❄️ Winter | Ice blue glow | December–February |
| 🌧️ Monsoon | Deep blue rain | August–October |
| 🌊 Ocean | Aqua blue light | Beach vibes |
| ⚡ Neon | Green glow + scanlines | Night mode |
| 🌌 Aurora | Purple/teal animated border | Dark aesthetic |
| 🤖 Cyberpunk | Yellow/pink sharp corners + glitch | Edgy dark |
| 🌅 Sunset | Red/purple gradient | Evening |
| 🌙 Midnight | Gold on black | Late night |
| 🍬 Candy | Pink bubblegum | Fun light |
| 🏜️ Desert | Orange/red earthy | Warm minimal |
| 🧊 Arctic | Cool ice blue light | Clean minimal |
| 🌋 Volcano | Orange lava glow | Dramatic dark |

### 10 Font Pairings

Classic, Modern, Elegant, Playful, Hacker, Raleway, Outfit, Syne, Bitter, Quicksand

All themes and fonts are saved to localStorage and persist across sessions.

---

## 📊 Analytics

Four time-range tabs, each with different chart types:

**Day tab:**
- Bar chart — last 7 days completion % (color-coded green/amber/red)
- Composed chart — completion count + percentage line overlay
- 28-day heatmap — GitHub contribution style

**Week tab:**
- Bar chart — 4-week comparison
- Bar chart — best day of week (best day highlighted in accent color)
- Radar chart — per-habit performance spider (requires 3+ habits)

**Month tab:**
- Area chart — 14-day trend with gradient fill
- Per-habit progress bars — completion %, streak, total completions

**Year tab:**
- Multi-color bar chart — month-over-month completion %
- Area chart — total completions per month
- Donut pie chart — habit distribution

---

## 📱 Progressive Web App (PWA)

Habitual is installable on Android and iOS:

- **Android** — Chrome shows an install banner automatically
- **iOS** — tap Share → "Add to Home Screen"

Once installed it works like a native app with:
- Full-screen mode (no browser chrome)
- App icon on home screen
- Offline support via service worker (cache-first for static assets, network-first for API)

---

## 🔌 API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth Routes

```
POST   /api/auth/register        { name, email, password }
POST   /api/auth/login           { email, password }
GET    /api/auth/me              → returns full user profile
PUT    /api/auth/profile         { name }
PUT    /api/auth/about           { age, gender, diet, occupation, ... }
PUT    /api/auth/password        { currentPassword, newPassword }
DELETE /api/auth/data            → deletes all habits and logs
```

### Habit Routes

```
GET    /api/habits               → list all active habits sorted by order
POST   /api/habits               { name, emoji, color, targetDays, description }
PUT    /api/habits/reorder       { order: [{ id, order }] }
PUT    /api/habits/:id           { any habit fields }
DELETE /api/habits/:id           → soft delete (sets isActive: false)
```

### Log Routes

```
GET    /api/logs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
POST   /api/logs                 { habitId, date, completed, note }
GET    /api/logs/stats           → currentStreak, bestStreak, totalCompletions, weeklyData, habitStats
```

### AI Routes

```
POST   /api/ai/chat              { messages: [{ role, content }] }
POST   /api/ai/tips              { weather, season, tempC }
POST   /api/ai/food              { mealType, weather, season, tempC }
```

---

## 🗄️ Database Models

### User

```
name, email, password (bcrypt hashed), avatar
age, gender, dateOfBirth
diet (veg | non_veg | vegan | jain | keto | other)
occupation (student | working | freelancer | homemaker | other)
occupationDetail (school/company name)
fitnessLevel (beginner | intermediate | advanced)
healthGoals []
allergies []
waterGoal (glasses/day), sleepGoal (hours)
weightKg, heightCm
city, bio, profileComplete
```

### Habit

```
userId, name, emoji, color
description, targetDaysPerWeek, targetDays []
reminderTime, order, isActive
```

### HabitLog

```
userId, habitId, date (YYYY-MM-DD string)
completed (boolean), note (string)
Compound unique index on { userId, habitId, date }
```

---

## ⚙️ Tech Stack

### Backend
- **Node.js + Express** — REST API server
- **MongoDB Atlas + Mongoose** — cloud database
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth tokens (30-day expiry)
- **Groq SDK / fetch** — AI chat completions

### Frontend
- **React 18 + Vite** — UI framework and build tool
- **Tailwind CSS** — utility classes
- **Recharts** — all charts (Bar, Line, Area, Radar, Pie, Composed)
- **Axios** — HTTP client with interceptors
- **React Router v6** — client-side routing
- **Lucide React** — icon library
- **IndexedDB** — offline write queue

### External Services
- **MongoDB Atlas** — free M0 cluster (512MB)
- **Groq** — free LLM API (Llama 3, 6000 tokens/min)
- **OpenWeatherMap** — free weather API (1000 calls/day)

---

## 🔄 Offline Support

When you lose internet connection:

1. Habit check-ins are stored in **IndexedDB** on your device
2. A sync banner appears showing how many changes are queued
3. When you come back online, all queued writes are automatically replayed to the server
4. You can also manually sync from the Profile page

---

## 🚀 Deployment

### Backend → Render (Free)

1. Push your `backend/` folder to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add Environment Variables (copy from your `.env` — except use your production MongoDB URI):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` → your Vercel frontend URL
   - `GROQ_API_KEY`
7. Deploy → copy the service URL (e.g. `https://habitual-api.onrender.com`)

### Frontend → Vercel (Free)

1. Push your `frontend/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Framework preset: **Vite**
4. Add Environment Variables:
   - `VITE_API_URL` → `https://habitual-api.onrender.com/api`
   - `VITE_WEATHER_KEY` → your OpenWeatherMap key
5. Deploy → your app is live at `https://your-app.vercel.app`

### Update CORS After Deploy

Go back to Render → your backend service → Environment → update `CLIENT_URL` to your Vercel URL.

---

## 🐛 Common Issues and Fixes

### "MongoDB connection error"
- Check your `MONGO_URI` is correct and has no spaces
- Check that your IP is whitelisted in Atlas Network Access (`0.0.0.0/0`)
- Make sure your Atlas username/password don't have special characters (if they do, URL-encode them — `@` becomes `%40`)

### "Weather not showing"
- New OpenWeatherMap keys take up to 10 minutes to activate
- Check `VITE_WEATHER_KEY` is set in `frontend/.env` (not backend)
- Make sure you allowed browser location access

### "AI chat not working"
- Check `GROQ_API_KEY` is set in `backend/.env`
- Check backend console for error messages
- Groq free tier has rate limits — wait 1 minute if you hit them

### "Themes not changing"
- Open DevTools → Application → Local Storage → clear `ht_theme` and `ht_font`
- Hard refresh with `Ctrl + Shift + R`

### "Login always fails"
- Make sure both frontend and backend are running
- Check `VITE_API_URL` in `frontend/.env` matches your backend port
- Check `CLIENT_URL` in `backend/.env` matches your frontend port

---

## ✅ Feature Checklist

### Core
- [x] JWT authentication — each user sees only their own data
- [x] One-tap habit check-in with optimistic UI updates
- [x] Long-press habit card to add a note
- [x] Drag-to-reorder habits
- [x] Add/edit/delete habits with emoji, color, target days
- [x] 4-step onboarding for new users
- [x] Confetti animation on perfect day completion

### Views
- [x] Dashboard — today view with progress ring
- [x] Weekly grid — bullet journal style Mon–Sun
- [x] Monthly grid — full calendar checkbox grid
- [x] Analytics — Day/Week/Month/Year with 8 chart types

### Personalization
- [x] 17 themes — Forest, Spring, Summer, Autumn, Winter, Monsoon, Ocean, Neon, Aurora, Cyberpunk, Sunset, Midnight, Candy, Desert, Arctic, Volcano, Forest Dark
- [x] 10 font pairings — Classic, Modern, Elegant, Playful, Hacker, Raleway, Outfit, Syne, Bitter, Quicksand
- [x] Theme-aware card styles (aurora glow, cyberpunk clip, neon scanlines)

### Weather + Seasons
- [x] Live weather via GPS or IP fallback
- [x] Animated weather effects — rain, snow, fog, storm, stars, shimmer
- [x] Frost overlay when temperature is below 5°C
- [x] Season particle effects — sakura petals (spring), falling leaves (autumn), gradient bar (summer)
- [x] Weather recommendation card on Dashboard
- [x] Temperature chip in header with comfort color coding
- [x] Season auto-detection based on month (India calendar)

### AI Coach
- [x] Chat with Groq AI (Llama 3) — free tier
- [x] AI knows your habits, diet, health goals, occupation, vitals
- [x] Voice input via Web Speech API
- [x] Text-to-speech for AI replies
- [x] Daily personalized tips on page load
- [x] Food recommendations based on diet + weather + season
- [x] Quick prompt buttons for common questions
- [x] Two-column desktop layout — tips on left, wide chat on right

### User Profile
- [x] 6-step About wizard — basic info, diet, occupation, fitness, goals, vitals
- [x] BMI auto-calculator
- [x] Water and sleep goal sliders
- [x] AI coach uses all profile data for personalization

### Technical
- [x] PWA — installable on Android and iOS
- [x] Offline support with IndexedDB write queue
- [x] Auto-sync when back online
- [x] Manual sync button in Profile
- [x] Sync status banner
- [x] Page transition animations (slide-up on route change)
- [x] Animated chart entries
- [x] Staggered card animations
- [x] Loading skeleton screens
- [x] Timezone-safe date handling (no UTC drift bugs)

---

## 🔮 Ideas for Next Steps

- [ ] Push notifications and habit reminders (Web Push API)
- [ ] Export data as CSV or PDF
- [ ] Avatar upload (Cloudinary)
- [ ] Habit categories and tags
- [ ] Friend/accountability partner feature
- [ ] Streaks protection (one skip allowed per week)
- [ ] Custom habit colors beyond the preset palette
- [ ] AI-generated habit suggestions based on your goals
- [ ] Integration with Google Fit / Apple Health

---

## 👨‍💻 Developer Notes

### Date Handling
All dates use local time strings (`YYYY-MM-DD`) via `getLocalDateStr()` helper. Never use `toISOString()` for habit dates — it returns UTC which can shift the date by hours depending on timezone.

### Provider Order in App.jsx
```
ThemeProvider
  WeatherProvider
    AuthProvider
      Routes
      WeatherEffects
      InstallPrompt
```
WeatherProvider must be outside AuthProvider so weather loads even before login. ThemeProvider must be outermost so CSS variables are set before any component renders.

### AI Context Window
Groq free tier has an 8192 token context window. The chat endpoint slices the last 20 messages to avoid overflow. Long conversations will lose early context — this is expected behavior.

### Offline Queue
Writes are queued in IndexedDB under the `habitual_offline` database. The queue replays on the `window.online` event. If a queued request fails during replay (e.g. server error), it stays in the queue and will retry next time you come online.

### Adding a New Theme
In `ThemeContext.jsx`, add a new entry to the `THEMES` object following the existing pattern. All CSS variables are applied to `:root` by the `useEffect` — no other changes needed.

---

## 📄 License

This project is for personal and educational use. Built as a learning project covering full-stack MERN development, PWA, AI integration, and modern React patterns.

---

*Built with 🌿 by Suyash Dubey*