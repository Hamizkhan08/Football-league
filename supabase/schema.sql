-- ============================================================
-- FOOTBALL LEAGUE TOURNAMENT - SUPABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- 1. Teams
CREATE TABLE IF NOT EXISTS teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  logo_url    TEXT DEFAULT '',
  pool        TEXT NOT NULL CHECK (pool IN ('A', 'B')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Players
CREATE TABLE IF NOT EXISTS players (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  image_url       TEXT DEFAULT '',
  jersey_number   INT DEFAULT 0,
  position        TEXT DEFAULT 'Player',
  goals           INT DEFAULT 0,
  assists         INT DEFAULT 0,
  matches_played  INT DEFAULT 0,
  is_captain      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Matches
CREATE TABLE IF NOT EXISTS matches (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_a_id   UUID NOT NULL REFERENCES teams(id),
  team_b_id   UUID NOT NULL REFERENCES teams(id),
  pool        TEXT NOT NULL CHECK (pool IN ('A', 'B')),
  match_date  TIMESTAMPTZ,
  status      TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  score_a     INT DEFAULT 0,
  score_b     INT DEFAULT 0,
  penalty_score_a INT DEFAULT NULL,
  penalty_score_b INT DEFAULT NULL,
  fouls_a     INT DEFAULT 0,
  fouls_b     INT DEFAULT 0,
  is_knockout BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Goals
CREATE TABLE IF NOT EXISTS goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES players(id),
  team_id     UUID NOT NULL REFERENCES teams(id),
  minute      INT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tournament Settings
CREATE TABLE IF NOT EXISTS tournament_settings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qualifiers_per_pool INT DEFAULT 2,
  current_stage       TEXT DEFAULT 'group' CHECK (current_stage IN ('group', 'knockout')),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Match Lineups (Squad of 9)
CREATE TABLE IF NOT EXISTS match_lineups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  is_starter  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- 7. Match Cards (Individual player cards)
CREATE TABLE IF NOT EXISTS match_cards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  card_type   TEXT NOT NULL CHECK (card_type IN ('yellow', 'red')),
  minute      INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE teams   ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_cards         ENABLE ROW LEVEL SECURITY;

-- Public can read everything
CREATE POLICY "Public can read teams"   ON teams   FOR SELECT USING (TRUE);
CREATE POLICY "Public can read players" ON players FOR SELECT USING (TRUE);
CREATE POLICY "Public can read matches" ON matches  FOR SELECT USING (TRUE);
CREATE POLICY "Public can read goals"   ON goals    FOR SELECT USING (TRUE);
CREATE POLICY "Public can read settings" ON tournament_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public can read lineups" ON match_lineups FOR SELECT USING (TRUE);
CREATE POLICY "Public can read cards" ON match_cards FOR SELECT USING (TRUE);

-- Only authenticated users can write
CREATE POLICY "Auth users can insert teams"   ON teams   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update teams"   ON teams   FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can insert players" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update players" ON players FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can insert matches" ON matches  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update matches" ON matches  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can insert goals"   ON goals    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete goals"   ON goals    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can update settings" ON tournament_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can insert settings" ON tournament_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth users can manage lineups" ON match_lineups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can manage cards" ON match_cards FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA: 10 TEAMS (5 per Pool)
-- ============================================================

INSERT INTO teams (id, name, captain_name, pool) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Thunder Strikers',  'Rahul Sharma',   'A'),
  ('aaaaaaaa-0001-0001-0001-000000000002', 'Green Warriors',    'Amit Patel',     'A'),
  ('aaaaaaaa-0001-0001-0001-000000000003', 'Red Phoenix',       'Suresh Kumar',   'A'),
  ('aaaaaaaa-0001-0001-0001-000000000004', 'Blue Eagles',       'Vikram Singh',   'A'),
  ('aaaaaaaa-0001-0001-0001-000000000005', 'Golden Tigers',     'Deepak Yadav',   'A'),
  ('aaaaaaaa-0001-0001-0001-000000000006', 'Silver Lions',      'Karan Mehta',    'B'),
  ('aaaaaaaa-0001-0001-0001-000000000007', 'Black Panthers',    'Rohit Verma',    'B'),
  ('aaaaaaaa-0001-0001-0001-000000000008', 'White Wolves',      'Nitin Gupta',    'B'),
  ('aaaaaaaa-0001-0001-0001-000000000009', 'Purple Cobras',     'Ajay Nair',      'B'),
  ('aaaaaaaa-0001-0001-0001-000000000010', 'Orange Falcons',    'Sanjay Tiwari',  'B')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA: PLAYERS (5 per team = 50 total)
-- ============================================================

-- Thunder Strikers (Pool A)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Rahul Sharma',   10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Priya Kapoor',    7, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Dev Malhotra',    5, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Arjun Bose',      9, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000001', 'Kartik Jain',     1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Green Warriors (Pool A)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000002', 'Amit Patel',      10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000002', 'Siddharth Roy',    8, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000002', 'Nikhil Das',       4, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000002', 'Yash Trivedi',    11, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000002', 'Ravi Shetty',      1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Red Phoenix (Pool A)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000003', 'Suresh Kumar',    10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000003', 'Aakash Reddy',     7, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000003', 'Pranav Rao',       3, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000003', 'Manoj Tiwari',     9, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000003', 'Lokesh Hegde',     1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Blue Eagles (Pool A)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000004', 'Vikram Singh',    10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000004', 'Anand Mishra',     6, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000004', 'Tarun Pillai',     5, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000004', 'Gaurav Nair',     11, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000004', 'Hemant Shah',      1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Golden Tigers (Pool A)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000005', 'Deepak Yadav',    10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000005', 'Farhan Shaikh',    8, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000005', 'Girish Patil',     4, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000005', 'Hitesh Varma',     9, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000005', 'Ishaan Chopra',    1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Silver Lions (Pool B)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000006', 'Karan Mehta',     10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000006', 'Lalit Soni',       7, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000006', 'Mohit Joshi',      3, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000006', 'Naveen Kulkarni', 11, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000006', 'Om Prakash',       1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Black Panthers (Pool B)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000007', 'Rohit Verma',     10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000007', 'Piyush Agarwal',   8, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000007', 'Qasim Khan',       4, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000007', 'Ramesh Babu',      9, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000007', 'Sunil Dhawan',     1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- White Wolves (Pool B)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000008', 'Nitin Gupta',     10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000008', 'Tejas More',       7, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000008', 'Umesh Bhatt',      5, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000008', 'Varun Dixit',     11, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000008', 'Wasim Ansari',     1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Purple Cobras (Pool B)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000009', 'Ajay Nair',       10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000009', 'Bikash Das',       8, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000009', 'Chirag Pandey',    4, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000009', 'Dhananjay Rao',    9, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000009', 'Eshan Malik',      1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- Orange Falcons (Pool B)
INSERT INTO players (team_id, name, jersey_number, position, is_captain) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000010', 'Sanjay Tiwari',   10, 'Forward',    TRUE),
  ('aaaaaaaa-0001-0001-0001-000000000010', 'Faisal Shaikh',    7, 'Midfielder', FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000010', 'Ganesh Iyer',      5, 'Defender',   FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000010', 'Harish Menon',    11, 'Forward',    FALSE),
  ('aaaaaaaa-0001-0001-0001-000000000010', 'Irfan Siddiqui',   1, 'Goalkeeper', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: MATCHES (Round Robin - 4 matches per team)
-- Pool A: 10 matches total, Pool B: 10 matches total
-- ============================================================

-- POOL A MATCHES (Round Robin: 5 teams = 10 matches)
INSERT INTO matches (team_a_id, team_b_id, pool, match_date, status) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000001','aaaaaaaa-0001-0001-0001-000000000002','A', NOW() + INTERVAL '1 day',  'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000003','aaaaaaaa-0001-0001-0001-000000000004','A', NOW() + INTERVAL '1 day',  'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000001','aaaaaaaa-0001-0001-0001-000000000003','A', NOW() + INTERVAL '2 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000002','aaaaaaaa-0001-0001-0001-000000000005','A', NOW() + INTERVAL '2 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000004','aaaaaaaa-0001-0001-0001-000000000005','A', NOW() + INTERVAL '3 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000001','aaaaaaaa-0001-0001-0001-000000000004','A', NOW() + INTERVAL '3 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000002','aaaaaaaa-0001-0001-0001-000000000003','A', NOW() + INTERVAL '4 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000003','aaaaaaaa-0001-0001-0001-000000000005','A', NOW() + INTERVAL '4 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000001','aaaaaaaa-0001-0001-0001-000000000005','A', NOW() + INTERVAL '5 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000002','aaaaaaaa-0001-0001-0001-000000000004','A', NOW() + INTERVAL '5 days', 'upcoming')
ON CONFLICT DO NOTHING;

-- POOL B MATCHES (Round Robin: 5 teams = 10 matches)
INSERT INTO matches (team_a_id, team_b_id, pool, match_date, status) VALUES
  ('aaaaaaaa-0001-0001-0001-000000000006','aaaaaaaa-0001-0001-0001-000000000007','B', NOW() + INTERVAL '1 day',  'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000008','aaaaaaaa-0001-0001-0001-000000000009','B', NOW() + INTERVAL '1 day',  'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000006','aaaaaaaa-0001-0001-0001-000000000008','B', NOW() + INTERVAL '2 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000007','aaaaaaaa-0001-0001-0001-000000000010','B', NOW() + INTERVAL '2 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000009','aaaaaaaa-0001-0001-0001-000000000010','B', NOW() + INTERVAL '3 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000006','aaaaaaaa-0001-0001-0001-000000000009','B', NOW() + INTERVAL '3 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000007','aaaaaaaa-0001-0001-0001-000000000008','B', NOW() + INTERVAL '4 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000008','aaaaaaaa-0001-0001-0001-000000000010','B', NOW() + INTERVAL '4 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000006','aaaaaaaa-0001-0001-0001-000000000010','B', NOW() + INTERVAL '5 days', 'upcoming'),
  ('aaaaaaaa-0001-0001-0001-000000000007','aaaaaaaa-0001-0001-0001-000000000009','B', NOW() + INTERVAL '5 days', 'upcoming')
ON CONFLICT DO NOTHING;

-- Seed Tournament Settings
INSERT INTO tournament_settings (qualifiers_per_pool, current_stage) VALUES (2, 'group');

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE match_lineups;
ALTER PUBLICATION supabase_realtime ADD TABLE match_cards;
