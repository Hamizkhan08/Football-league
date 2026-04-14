-- ==========================================
-- CPL 2026: COLLEGE PREMIER LEAGUE
-- ADVANCED SEEDING & SIMULATION SCRIPT
-- ==========================================

-- 1. DATABASE SCHEMA REFACTOR
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pool text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_name text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_qualified boolean DEFAULT false;

-- Add jersey_no and remove assists
ALTER TABLE players ADD COLUMN IF NOT EXISTS jersey_no integer;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_captain boolean DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS goals integer DEFAULT 0;
ALTER TABLE players DROP COLUMN IF EXISTS assists; -- REMOVE ASSISTS
ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_played integer DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_knockout boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS knockout_round text; -- 'sf', '3rd', 'final'
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_score_a integer DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_score_b integer DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS pool text;
-- Fix check constraint if it exists to allow 'KO'
DO $$ 
BEGIN 
    ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_pool_check;
    ALTER TABLE matches ADD CONSTRAINT matches_pool_check CHECK (pool IN ('A', 'B', 'KO'));
EXCEPTION 
    WHEN undefined_object THEN NULL; 
END $$;

CREATE TABLE IF NOT EXISTS match_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
    player_id uuid REFERENCES players(id) ON DELETE CASCADE,
    team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
    minute integer,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo_url text NOT NULL,
    website_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. DATA RESET
TRUNCATE TABLE match_goals, players, matches, teams, sponsors CASCADE;

-- 3. INSERT SPONSORS
INSERT INTO sponsors (name, logo_url) VALUES 
('Nike', 'https://logo.clearbit.com/nike.com'),
('Adidas', 'https://logo.clearbit.com/adidas.com'),
('Red Bull', 'https://logo.clearbit.com/redbull.com'),
('EA Sports', 'https://logo.clearbit.com/ea.com'),
('Pepsi', 'https://logo.clearbit.com/pepsi.com'),
('Emirates', 'https://logo.clearbit.com/emirates.com');

-- 3. INSERT TEAMS (CPL 2026)
INSERT INTO teams (name, captain_name, pool, logo_url) VALUES 
('A3 Heroes', 'Harsh', 'A', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&h=128&fit=crop'),
('Dynamic Destroyers', 'Bhagwan', 'A', 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=128&h=128&fit=crop'),
('Urban Kickers', 'Krish', 'A', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=128&h=128&fit=crop'),
('Viking Warriors', 'Ashmak', 'A', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&h=128&fit=crop'),
('Top Predators', 'Ritesh', 'A', 'https://images.unsplash.com/photo-1431324155629-1a6eda1eed15?w=128&h=128&fit=crop'),
('Elite Warriors', 'Dhruv', 'B', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=128&h=128&fit=crop'),
('Ronak Dominators', 'Sahil', 'B', 'https://images.unsplash.com/photo-1518091043644-c1d445bcc97a?w=128&h=128&fit=crop'),
('NSA', 'Gurman', 'B', 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=128&h=128&fit=crop'),
('Culers FC', 'Aditya', 'B', 'https://images.unsplash.com/photo-1564591985182-74244976dd78?w=128&h=128&fit=crop'),
('Ishan FC', 'Khemraj', 'B', 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=128&h=128&fit=crop');

-- 4. INSERT SQUADS WITH RANDOM JERSEY NUMBERS
DO $$
DECLARE
    team_rec RECORD;
    player_names text[] := ARRAY['Aarav', 'Vihaan', 'Arjun', 'Sai', 'Krishna', 'Ishaan', 'Shaurya', 'Aryan', 'Kabir', 'Rudra', 'Vedant', 'Aditya', 'Vivaan', 'Reyansh', 'Ayush'];
    p_name text;
    j_no integer;
BEGIN
    FOR team_rec IN SELECT * FROM teams LOOP
        -- INSERT 10-12 players per team
        FOR i IN 1..10 LOOP
            p_name := player_names[1 + floor(random()*15)] || ' ' || team_rec.name || ' Player ' || i;
            j_no := floor(random()*99) + 1;
            INSERT INTO players (team_id, name, is_captain, position, jersey_no, image_url)
            VALUES (team_rec.id, p_name, (i=1), 
            CASE WHEN i=1 THEN 'Goalkeeper' WHEN i < 5 THEN 'Defender' WHEN i < 8 THEN 'Midfielder' ELSE 'Forward' END,
            j_no, 
            'https://images.unsplash.com/photo-1552318955-90d4df738271?w=256&h=256&fit=crop&q=80');
        END LOOP;
    END LOOP;
END $$;

-- 5. SIMULATION ENGINE
CREATE OR REPLACE PROCEDURE simulate_game(m_id uuid, t_a_id uuid, t_b_id uuid, is_ko boolean)
LANGUAGE plpgsql AS $$
DECLARE
    s_a integer := floor(random()*4); -- Random scores 0-3
    s_b integer := floor(random()*4);
    p_rec RECORD;
BEGIN
    -- For KO, ensure no draws or simulate penalties
    IF is_ko AND s_a = s_b THEN
        s_a := s_a + 1; -- Simple win for simulation
    END IF;

    UPDATE matches SET score_a = s_a, score_b = s_b, status = 'completed' WHERE id = m_id;
    
    -- Sync Goals
    FOR i IN 1..s_a LOOP
        SELECT id INTO p_rec FROM players WHERE team_id = t_a_id ORDER BY random() LIMIT 1;
        INSERT INTO match_goals (match_id, player_id, team_id, minute) VALUES (m_id, p_rec.id, t_a_id, floor(random()*90));
        UPDATE players SET goals = goals + 1 WHERE id = p_rec.id;
    END LOOP;
    FOR i IN 1..s_b LOOP
        SELECT id INTO p_rec FROM players WHERE team_id = t_b_id ORDER BY random() LIMIT 1;
        INSERT INTO match_goals (match_id, player_id, team_id, minute) VALUES (m_id, p_rec.id, t_b_id, floor(random()*90));
        UPDATE players SET goals = goals + 1 WHERE id = p_rec.id;
    END LOOP;

    -- Sync Matches Played
    UPDATE players SET matches_played = matches_played + 1 WHERE team_id IN (t_a_id, t_b_id);
END;
$$;

-- 6. RUN LEAGUE (ROUND ROBIN = 4 GAMES EACH)
DO $$
DECLARE
    t1 RECORD;
    t2 RECORD;
    m_id uuid;
BEGIN
    -- POOL A
    FOR t1 IN SELECT * FROM teams WHERE pool = 'A' LOOP
        FOR t2 IN SELECT * FROM teams WHERE pool = 'A' AND id > t1.id LOOP
            INSERT INTO matches (team_a_id, team_b_id, pool, status, is_knockout, match_date)
            VALUES (t1.id, t2.id, 'A', 'completed', false, now() - interval '2 days')
            RETURNING id INTO m_id;
            CALL simulate_game(m_id, t1.id, t2.id, false);
        END LOOP;
    END LOOP;
    -- POOL B
    FOR t1 IN SELECT * FROM teams WHERE pool = 'B' LOOP
        FOR t2 IN SELECT * FROM teams WHERE pool = 'B' AND id > t1.id LOOP
            INSERT INTO matches (team_a_id, team_b_id, pool, status, is_knockout, match_date)
            VALUES (t1.id, t2.id, 'B', 'completed', false, now() - interval '2 days')
            RETURNING id INTO m_id;
            CALL simulate_game(m_id, t1.id, t2.id, false);
        END LOOP;
    END LOOP;
END $$;

-- 7. EXECUTE KNOCKOUTS
DO $$
DECLARE
    a1 uuid; a2 uuid; b1 uuid; b2 uuid;
    sf1_id uuid; sf2_id uuid;
    sf1_w uuid; sf1_l uuid; sf2_w uuid; sf2_l uuid;
    sf1_rec RECORD; sf2_rec RECORD;
    m_id uuid;
BEGIN
    -- Find Top 2 from Pool A (by Pts, then GD)
    -- Using a standard points calculation in SQL for ranking
    WITH standings AS (
        SELECT t.id, t.pool,
               COALESCE(SUM(CASE WHEN m.score_a > m.score_b THEN 3 WHEN m.score_a = m.score_b THEN 1 ELSE 0 END), 0) as pts,
               COALESCE(SUM(m.score_a - m.score_b), 0) as gd
        FROM teams t
        LEFT JOIN matches m ON (t.id = m.team_a_id AND NOT m.is_knockout)
        GROUP BY t.id, t.pool
    )
    SELECT id INTO a1 FROM (SELECT id FROM teams WHERE pool = 'A' ORDER BY random() LIMIT 1) s; -- Simple random qualify for now as requested
    SELECT id INTO a2 FROM (SELECT id FROM teams WHERE pool = 'A' AND id != a1 ORDER BY random() LIMIT 1) s;
    SELECT id INTO b1 FROM (SELECT id FROM teams WHERE pool = 'B' ORDER BY random() LIMIT 1) s;
    SELECT id INTO b2 FROM (SELECT id FROM teams WHERE pool = 'B' AND id != b1 ORDER BY random() LIMIT 1) s;

    -- Update is_qualified
    UPDATE teams SET is_qualified = true WHERE id IN (a1, a2, b1, b2);

    -- Semi-Finals
    INSERT INTO matches (team_a_id, team_b_id, status, is_knockout, knockout_round, match_date, pool) 
    VALUES (a1, b2, 'completed', true, 'sf', now() - interval '1 day', 'KO') RETURNING id INTO sf1_id;
    CALL simulate_game(sf1_id, a1, b2, true);

    INSERT INTO matches (team_a_id, team_b_id, status, is_knockout, knockout_round, match_date, pool) 
    VALUES (b1, a2, 'completed', true, 'sf', now() - interval '1 day', 'KO') RETURNING id INTO sf2_id;
    CALL simulate_game(sf2_id, b1, a2, true);

    -- Get SF results
    SELECT CASE WHEN score_a > score_b THEN team_a_id ELSE team_b_id END as winner,
           CASE WHEN score_a > score_b THEN team_b_id ELSE team_a_id END as loser
    INTO sf1_rec FROM matches WHERE id = sf1_id;
    
    SELECT CASE WHEN score_a > score_b THEN team_a_id ELSE team_b_id END as winner,
           CASE WHEN score_a > score_b THEN team_b_id ELSE team_a_id END as loser
    INTO sf2_rec FROM matches WHERE id = sf2_id;

    -- 3rd Place Match
    INSERT INTO matches (team_a_id, team_b_id, status, is_knockout, knockout_round, match_date, pool)
    VALUES (sf1_rec.loser, sf2_rec.loser, 'completed', true, '3rd', now(), 'KO') RETURNING id INTO m_id;
    CALL simulate_game(m_id, sf1_rec.loser, sf2_rec.loser, true);

    -- Grand Final
    INSERT INTO matches (team_a_id, team_b_id, status, is_knockout, knockout_round, match_date, pool)
    VALUES (sf1_rec.winner, sf2_rec.winner, 'completed', true, 'final', now(), 'KO') RETURNING id INTO m_id;
    CALL simulate_game(m_id, sf1_rec.winner, sf2_rec.winner, true);

END $$;
