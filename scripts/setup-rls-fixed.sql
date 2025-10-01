-- Настройка Row Level Security (RLS) для безопасности (исправленная версия)

-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики если они есть
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can add contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can view groups they participate in" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Admins can update groups" ON groups;
DROP POLICY IF EXISTS "Users can view group participants" ON group_participants;
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can view message reads" ON message_reads;
DROP POLICY IF EXISTS "Users can mark messages as read" ON message_reads;

-- Политики для таблицы users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id::text = current_setting('app.current_user_id', true));

-- Политики для таблицы contacts
CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT USING (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can add contacts" ON contacts
    FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own contacts" ON contacts
    FOR DELETE USING (user_id::text = current_setting('app.current_user_id', true));

-- Политики для таблицы groups
CREATE POLICY "Users can view groups they participate in" ON groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_participants 
            WHERE group_id = groups.id 
            AND user_id::text = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Users can create groups" ON groups
    FOR INSERT WITH CHECK (admin_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can update groups" ON groups
    FOR UPDATE USING (admin_id::text = current_setting('app.current_user_id', true));

-- Политики для таблицы group_participants
CREATE POLICY "Users can view group participants" ON group_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_participants gp2
            WHERE gp2.group_id = group_participants.group_id 
            AND gp2.user_id::text = current_setting('app.current_user_id', true)
        )
    );

-- Политики для таблицы chats
CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_id = chats.id 
            AND user_id::text = current_setting('app.current_user_id', true)
        )
    );

-- Политики для таблицы chat_participants
CREATE POLICY "Users can view chat participants" ON chat_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants cp2
            WHERE cp2.chat_id = chat_participants.chat_id 
            AND cp2.user_id::text = current_setting('app.current_user_id', true)
        )
    );

-- Политики для таблицы messages
CREATE POLICY "Users can view messages in their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_id = messages.chat_id 
            AND user_id::text = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Users can send messages to their chats" ON messages
    FOR INSERT WITH CHECK (
        sender_id::text = current_setting('app.current_user_id', true) AND
        EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE chat_id = messages.chat_id 
            AND user_id::text = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (sender_id::text = current_setting('app.current_user_id', true));

-- Политики для таблицы message_reads
CREATE POLICY "Users can view message reads" ON message_reads
    FOR SELECT USING (user_id::text = current_setting('app.current_user_id', true));

CREATE POLICY "Users can mark messages as read" ON message_reads
    FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', true));
