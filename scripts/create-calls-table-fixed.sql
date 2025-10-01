-- Создание таблицы для звонков между пользователями

-- Создаем таблицу calls
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    call_type VARCHAR(10) NOT NULL CHECK (call_type IN ('voice', 'video')),
    status VARCHAR(20) NOT NULL DEFAULT 'calling' CHECK (status IN ('calling', 'ringing', 'accepted', 'declined', 'ended', 'missed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- в секундах
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем внешние ключи только если таблица users существует
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Добавляем внешние ключи
        ALTER TABLE calls 
        ADD CONSTRAINT fk_calls_caller 
        FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE;
        
        ALTER TABLE calls 
        ADD CONSTRAINT fk_calls_receiver 
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Ограничения уже существуют, игнорируем
        NULL;
END $$;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver_id ON calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_user_status ON calls(caller_id, receiver_id, status);

-- Создаем триггер для обновления updated_at
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_calls_updated_at ON calls;
        CREATE TRIGGER update_calls_updated_at 
            BEFORE UPDATE ON calls
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Проверяем, что таблица создана
SELECT 'SUCCESS: Calls table created successfully' as result;

-- Показываем структуру таблицы
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'calls' 
ORDER BY ordinal_position;
