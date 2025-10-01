-- Полезные функции для 100GRAM (исправленная версия)

-- Функция для получения чатов пользователя с последними сообщениями
CREATE OR REPLACE FUNCTION get_user_chats_with_last_message(user_uuid UUID)
RETURNS TABLE (
    chat_id UUID,
    chat_type VARCHAR(20),
    group_id UUID,
    group_name VARCHAR(100),
    group_avatar TEXT,
    last_message_content TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as chat_id,
        c.type as chat_type,
        c.group_id,
        g.name as group_name,
        g.avatar as group_avatar,
        m.content as last_message_content,
        m.created_at as last_message_time,
        (
            SELECT COUNT(*)
            FROM messages m2
            WHERE m2.chat_id = c.id
            AND m2.sender_id != user_uuid
            AND NOT EXISTS (
                SELECT 1 FROM message_reads mr
                WHERE mr.message_id = m2.id
                AND mr.user_id = user_uuid
            )
        ) as unread_count
    FROM chats c
    INNER JOIN chat_participants cp ON cp.chat_id = c.id
    LEFT JOIN groups g ON g.id = c.group_id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM messages
        WHERE chat_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    ) m ON true
    WHERE cp.user_id = user_uuid
    ORDER BY m.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Функция для поиска пользователей
CREATE OR REPLACE FUNCTION search_users(search_query TEXT, current_user_uuid UUID)
RETURNS TABLE (
    id UUID,
    login VARCHAR(50),
    name VARCHAR(100),
    avatar TEXT,
    is_online BOOLEAN,
    last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.login,
        u.name,
        u.avatar,
        u.is_online,
        u.last_seen
    FROM users u
    WHERE u.id != current_user_uuid
    AND (
        u.login ILIKE '%' || search_query || '%'
        OR u.name ILIKE '%' || search_query || '%'
    )
    ORDER BY u.is_online DESC, u.last_seen DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Функция для создания приватного чата между пользователями
CREATE OR REPLACE FUNCTION create_private_chat(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID AS $$
DECLARE
    chat_uuid UUID;
    existing_chat_uuid UUID;
BEGIN
    -- Проверяем, существует ли уже чат между этими пользователями
    SELECT c.id INTO existing_chat_uuid
    FROM chats c
    INNER JOIN chat_participants cp1 ON cp1.chat_id = c.id AND cp1.user_id = user1_uuid
    INNER JOIN chat_participants cp2 ON cp2.chat_id = c.id AND cp2.user_id = user2_uuid
    WHERE c.type = 'private'
    LIMIT 1;
    
    IF existing_chat_uuid IS NOT NULL THEN
        RETURN existing_chat_uuid;
    END IF;
    
    -- Создаем новый чат
    INSERT INTO chats (type) VALUES ('private') RETURNING id INTO chat_uuid;
    
    -- Добавляем участников
    INSERT INTO chat_participants (chat_id, user_id) VALUES 
        (chat_uuid, user1_uuid),
        (chat_uuid, user2_uuid);
    
    RETURN chat_uuid;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения участников чата
CREATE OR REPLACE FUNCTION get_chat_participants(chat_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    login VARCHAR(50),
    name VARCHAR(100),
    avatar TEXT,
    is_online BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.login,
        u.name,
        u.avatar,
        u.is_online
    FROM users u
    INNER JOIN chat_participants cp ON cp.user_id = u.id
    WHERE cp.chat_id = chat_uuid;
END;
$$ LANGUAGE plpgsql;
