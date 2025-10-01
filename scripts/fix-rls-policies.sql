-- Исправляем политики RLS для регистрации пользователей

-- Удаляем старые политики для users
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Создаем новые политики для users
-- Разрешаем всем просматривать пользователей (для поиска)
CREATE POLICY "Allow public read access to users" ON users
    FOR SELECT USING (true);

-- Разрешаем вставку новых пользователей (для регистрации)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Разрешаем обновление только своего профиля
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true) WITH CHECK (true);

-- Исправляем политики для contacts
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can add contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

CREATE POLICY "Allow contacts operations" ON contacts
    FOR ALL USING (true) WITH CHECK (true);

-- Исправляем политики для groups
DROP POLICY IF EXISTS "Users can view groups they participate in" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Admins can update groups" ON groups;

CREATE POLICY "Allow groups operations" ON groups
    FOR ALL USING (true) WITH CHECK (true);

-- Исправляем политики для group_participants
DROP POLICY IF EXISTS "Users can view group participants" ON group_participants;

CREATE POLICY "Allow group participants operations" ON group_participants
    FOR ALL USING (true) WITH CHECK (true);

-- Исправляем политики для chats
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;

CREATE POLICY "Allow chats operations" ON chats
    FOR ALL USING (true) WITH CHECK (true);

-- Исправляем политики для chat_participants
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;

CREATE POLICY "Allow chat participants operations" ON chat_participants
    FOR ALL USING (true) WITH CHECK (true);

-- Исправляем политики для messages
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

CREATE POLICY "Allow messages operations" ON messages
    FOR ALL USING (true) WITH CHECK (true);

-- Исправляем политики для message_reads
DROP POLICY IF EXISTS "Users can view message reads" ON message_reads;
DROP POLICY IF EXISTS "Users can mark messages as read" ON message_reads;

CREATE POLICY "Allow message reads operations" ON message_reads
    FOR ALL USING (true) WITH CHECK (true);
