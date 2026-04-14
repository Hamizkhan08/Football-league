# ⚽ TurfLeague — 5v5 Football Tournament App

A full-stack football league management web application built with **React + Vite**, **Tailwind CSS**, and **Supabase**.

---

## 🚀 Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Frontend    | React 18 + Vite               |
| Styling     | Tailwind CSS v3               |
| Backend/DB  | Supabase (PostgreSQL)         |
| Auth        | Supabase Auth (Email/Password)|
| Realtime    | Supabase Realtime             |
| Routing     | React Router v6               |
| Icons       | Lucide React                  |
| Toasts      | react-hot-toast               |

---

## ⚙️ Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project** → Fill in name, password, region
3. Wait for the project to boot (~1 min)

### Step 2: Run the SQL Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste **all contents** of `supabase/schema.sql`
4. Click **Run**

This creates:
- ✅ 4 tables: `teams`, `players`, `matches`, `goals`
- ✅ Row-Level Security policies
- ✅ Seed data: 10 teams, 50 players, 20 round-robin matches

### Step 3: Enable Realtime

In Supabase Dashboard:
1. Go to **Database → Replication**
2. Enable **Realtime** for these tables:
   - `matches`
   - `goals`
   - `players`

### Step 4: Get Your API Keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon / public** key

### Step 5: Configure Environment Variables

```bash
# In the project root, create .env
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Step 6: Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── layout/        # Navbar, Footer, Layout
│   ├── ui/            # Badge, StatCard, TeamCard, Spinner
│   ├── match/         # MatchCard, LiveMatchControl, GoalEvent
│   └── points/        # PoolTable
├── context/
│   └── AuthContext.jsx
├── hooks/
│   ├── useTeams.js
│   ├── useMatches.js
│   └── useLiveMatch.js
├── lib/
│   └── supabase.js
├── pages/
│   ├── Home.jsx
│   ├── Teams.jsx
│   ├── TeamDetail.jsx
│   ├── PointsTable.jsx
│   ├── TopScorers.jsx
│   ├── MatchSchedule.jsx
│   ├── LiveMatches.jsx
│   ├── LiveMatchDetail.jsx
│   └── auth/Login.jsx, Signup.jsx
└── utils/
    └── standings.js
supabase/
└── schema.sql
```

---

## 🗄️ Database Schema

### `teams`
| Column        | Type | Notes         |
|---------------|------|---------------|
| id            | uuid | Primary key   |
| name          | text | Team name     |
| captain_name  | text | Captain       |
| logo_url      | text | Optional logo |
| pool          | text | "A" or "B"   |

### `players`
| Column          | Type    | Notes              |
|-----------------|---------|--------------------|
| id              | uuid    | Primary key        |
| team_id         | uuid    | FK → teams         |
| name            | text    | Player name        |
| jersey_number   | int     | Jersey #           |
| position        | text    | Forward/Midfielder/etc |
| goals           | int     | Default 0          |
| assists         | int     | Default 0          |
| matches_played  | int     | Default 0          |
| is_captain      | boolean | Captain flag       |

### `matches`
| Column      | Type      | Notes                        |
|-------------|-----------|------------------------------|
| id          | uuid      | Primary key                  |
| team_a_id   | uuid      | FK → teams                   |
| team_b_id   | uuid      | FK → teams                   |
| pool        | text      | "A" or "B"                  |
| match_date  | timestamp | Scheduled time               |
| status      | text      | upcoming / live / completed  |
| score_a     | int       | Team A score                 |
| score_b     | int       | Team B score                 |
| fouls_a     | int       | Team A fouls                 |
| fouls_b     | int       | Team B fouls                 |

### `goals`
| Column     | Type | Notes            |
|------------|------|------------------|
| id         | uuid | Primary key      |
| match_id   | uuid | FK → matches     |
| player_id  | uuid | FK → players     |
| team_id    | uuid | FK → teams       |
| minute     | int  | Minute of goal   |

---

## 🔐 Authentication

- **Public**: can view all pages, teams, standings, schedule, scorers
- **Authenticated**: can manage live matches (start, end, goals, fouls)
- **Admin**: set `is_admin: true` in Supabase Auth user metadata (Dashboard → Authentication → Users → Edit metadata)

---

## 📊 Points System

| Result | Points |
|--------|--------|
| Win    | 3      |
| Draw   | 1      |
| Loss   | 0      |

Tiebreaker: Goal Difference → Goals For

---

## 🔴 Live Match Flow

1. Go to `/live` → Click **Manage Match** on any match
2. Click **Start Match** to set status to `live`
3. Record goals (select player + minute)
4. Record fouls per team
5. Click **End Match** to finalize

---

## ✏️ Updating Team/Player Data

Replace the seed data in `supabase/schema.sql` with your real team names and players. Or update directly in the **Supabase Dashboard → Table Editor**.
