-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats_users table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS chats_users (
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (chat_id, user_id)
);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their chats" ON chats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats_users
            WHERE chats_users.chat_id = chats.id
            AND chats_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their chats" ON chats
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM chats_users
            WHERE chats_users.chat_id = chats.id
            AND chats_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view messages in their chats" ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats_users
            WHERE chats_users.chat_id = messages.chat_id
            AND chats_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their chats" ON messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats_users
            WHERE chats_users.chat_id = messages.chat_id
            AND chats_users.user_id = auth.uid()
        )
    );
