-- Articon Hackathon Database Schema
-- Run this entire script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create category enum
CREATE TYPE IF NOT EXISTS category_enum AS ENUM ('video', 'ui_ux', 'graphics');

-- Create notification target enum
CREATE TYPE IF NOT EXISTS notification_target AS ENUM ('all', 'winners', 'specific');

-- Create notification status enum
CREATE TYPE IF NOT EXISTS notification_status AS ENUM ('pending', 'sent', 'failed');

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    whatsapp_no VARCHAR(20) NOT NULL,
    category category_enum NOT NULL,
    city VARCHAR(255) NOT NULL,
    portfolio_url TEXT,
    is_present BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category category_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create judges table
CREATE TABLE IF NOT EXISTS judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    assigned_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    drive_link TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    judge_id UUID REFERENCES judges(id) ON DELETE SET NULL,
    preview_url TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_id, task_id) -- Each participant can only submit once per task
);

-- Create winners table
CREATE TABLE IF NOT EXISTS winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 3),
    category category_enum NOT NULL,
    announcement_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    target_audience notification_target NOT NULL DEFAULT 'all',
    target_ids UUID[] DEFAULT NULL,
    status notification_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_settings table
CREATE TABLE IF NOT EXISTS event_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_category ON participants(category);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_submissions_participant ON submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_judge ON submissions(judge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(score);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_time ON notifications(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_winners_category ON winners(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_judges_updated_at BEFORE UPDATE ON judges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_winners_updated_at BEFORE UPDATE ON winners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_settings_updated_at BEFORE UPDATE ON event_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for judge count increment/decrement
CREATE OR REPLACE FUNCTION increment_judge_count(judge_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE judges
    SET assigned_count = assigned_count + 1
    WHERE id = judge_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_judge_count(judge_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE judges
    SET assigned_count = GREATEST(0, assigned_count - 1)
    WHERE id = judge_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create view for submission statistics
CREATE OR REPLACE VIEW submission_statistics AS
SELECT
    'total_submissions' as metric,
    COUNT(*) as value
FROM submissions
UNION ALL
SELECT
    'scored_submissions' as metric,
    COUNT(*) as value
FROM submissions
WHERE score IS NOT NULL
UNION ALL
SELECT
    'average_score' as metric,
    ROUND(AVG(score), 2) as value
FROM submissions
WHERE score IS NOT NULL
UNION ALL
SELECT
    'submissions_by_category' as metric,
    category::text as value
FROM (
    SELECT
        p.category,
        COUNT(*) as submission_count
    FROM submissions s
    JOIN participants p ON s.participant_id = p.id
    GROUP BY p.category
    ORDER BY submission_count DESC
    LIMIT 1
) sub;

-- Insert default event settings
INSERT INTO event_settings (key, value) VALUES
    ('event_name', 'Articon Hackathon 2024'),
    ('event_start_date', '2024-12-01T09:00:00Z'),
    ('event_end_date', '2024-12-01T18:00:00Z'),
    ('registration_open', 'true'),
    ('submissions_open', 'true'),
    ('judging_active', 'false'),
    ('max_participants', '100'),
    ('submission_deadline', '2024-12-01T17:00:00Z')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Participants policies
CREATE POLICY "Participants can view their own profile" ON participants
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Public can view participants info" ON participants
    FOR SELECT USING (true);

-- Tasks policies
CREATE POLICY "Anyone can view tasks" ON tasks
    FOR SELECT USING (true);

-- Judges policies
CREATE POLICY "Judges can view their own profile" ON judges
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Judges can update their own profile" ON judges
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins policies
CREATE POLICY "Admins can view their own profile" ON admins
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can update their own profile" ON admins
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Submissions policies
CREATE POLICY "Participants can view their own submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM participants
            WHERE id = submissions.participant_id
            AND auth.uid()::text = id::text
        )
    );

CREATE POLICY "Judges can view assigned submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM judges
            WHERE id = submissions.judge_id
            AND auth.uid()::text = id::text
        )
    );

CREATE POLICY "Judges can update assigned submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM judges
            WHERE id = submissions.judge_id
            AND auth.uid()::text = id::text
        )
    );

-- Public submissions policy for admins (they'll use service role)
CREATE POLICY "Public view of submissions" ON submissions
    FOR SELECT USING (true);

-- Winners, notifications, event settings policies
CREATE POLICY "Anyone can view winners" ON winners FOR SELECT USING (true);
CREATE POLICY "Anyone can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can view event settings" ON event_settings FOR SELECT USING (true);