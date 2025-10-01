-- Исправленные функции для работы со звонками

-- Сначала создаем таблицу calls если её нет
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    call_type VARCHAR(10) NOT NULL CHECK (call_type IN ('voice', 'video')),
    status VARCHAR(20) NOT NULL DEFAULT 'calling' CHECK (status IN ('calling', 'ringing', 'accepted', 'declined', 'ended', 'missed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver_id ON calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);

-- Удаляем старые функции если они есть
DROP FUNCTION IF EXISTS get_active_calls(UUID);
DROP FUNCTION IF EXISTS create_call(UUID, UUID, VARCHAR);
DROP FUNCTION IF EXISTS update_call_status(UUID, VARCHAR);

-- Функция для получения активных звонков пользователя (исправленная)
CREATE OR REPLACE FUNCTION get_active_calls(user_uuid UUID)
RETURNS TABLE (
    call_id UUID,
    caller_id UUID,
    receiver_id UUID,
    call_type VARCHAR(10),
    status VARCHAR(20),
    started_at TIMESTAMP WITH TIME ZONE,
    caller_login VARCHAR(50),
    caller_name VARCHAR(100),
    caller_avatar TEXT,
    receiver_login VARCHAR(50),
    receiver_name VARCHAR(100),
    receiver_avatar TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as call_id,
        c.caller_id,
        c.receiver_id,
        c.call_type,
        c.status,
        c.started_at,
        u1.login as caller_login,
        u1.name as caller_name,
        u1.avatar as caller_avatar,
        u2.login as receiver_login,
        u2.name as receiver_name,
        u2.avatar as receiver_avatar
    FROM calls c
    INNER JOIN users u1 ON u1.id = c.caller_id
    INNER JOIN users u2 ON u2.id = c.receiver_id
    WHERE (c.caller_id = user_uuid OR c.receiver_id = user_uuid)
    AND c.status IN ('calling', 'ringing', 'accepted')
    ORDER BY c.created_at DESC
    LIMIT 5;
END;
$$;

-- Функция для создания нового звонка (исправленная)
CREATE OR REPLACE FUNCTION create_call(
    caller_uuid UUID,
    receiver_uuid UUID,
    call_type_param VARCHAR(10)
)
RETURNS UUID 
LANGUAGE plpgsql
AS $$
DECLARE
    call_uuid UUID;
BEGIN
    -- Завершаем все активные звонки пользователей
    UPDATE calls 
    SET status = 'ended', ended_at = NOW(), updated_at = NOW()
    WHERE (caller_id = caller_uuid OR receiver_id = caller_uuid OR caller_id = receiver_uuid OR receiver_id = receiver_uuid)
    AND status IN ('calling', 'ringing', 'accepted');
    
    -- Создаем новый звонок
    INSERT INTO calls (caller_id, receiver_id, call_type, status)
    VALUES (caller_uuid, receiver_uuid, call_type_param, 'calling')
    RETURNING id INTO call_uuid;
    
    RETURN call_uuid;
END;
$$;

-- Функция для обновления статуса звонка (исправленная)
CREATE OR REPLACE FUNCTION update_call_status(
    call_uuid UUID,
    new_status VARCHAR(20)
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE calls 
    SET 
        status = new_status,
        answered_at = CASE WHEN new_status = 'accepted' THEN NOW() ELSE answered_at END,
        ended_at = CASE WHEN new_status IN ('declined', 'ended', 'missed') THEN NOW() ELSE ended_at END,
        updated_at = NOW()
    WHERE id = call_uuid;
    
    RETURN FOUND;
END;
$$;

-- Проверяем, что функции созданы
SELECT 'SUCCESS: All call functions created successfully' as result;
