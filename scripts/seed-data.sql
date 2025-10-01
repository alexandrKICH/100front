-- Добавление тестовых данных

-- Добавляем тестовых пользователей
INSERT INTO users (login, password_hash, name, avatar, status, is_online) VALUES
('testuser1', '$2b$10$example1', 'Тестовый Пользователь 1', '/placeholder.svg?height=40&width=40', 'online', true),
('testuser2', '$2b$10$example2', 'Тестовый Пользователь 2', '/placeholder.svg?height=40&width=40', 'online', true),
('testuser3', '$2b$10$example3', 'Тестовый Пользователь 3', '/placeholder.svg?height=40&width=40', 'offline', false)
ON CONFLICT (login) DO NOTHING;

-- Создаем тестовую группу
INSERT INTO groups (name, description, avatar, admin_id) 
SELECT 'Тестовая Группа', 'Группа для тестирования', '/placeholder.svg?height=40&width=40', u.id
FROM users u WHERE u.login = 'testuser1'
ON CONFLICT DO NOTHING;
