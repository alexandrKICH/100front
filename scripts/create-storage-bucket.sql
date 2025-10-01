-- Создание bucket для файлов в Supabase Storage
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- Создаем bucket для файлов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/*', 'video/*', 'audio/*', 'application/*', 'text/*']
)
ON CONFLICT (id) DO NOTHING;

-- Создаем политику для публичного доступа к файлам
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'files');

-- Создаем политику для загрузки файлов
CREATE POLICY "Allow file uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files');

-- Создаем политику для обновления файлов
CREATE POLICY "Allow file updates" ON storage.objects FOR UPDATE USING (bucket_id = 'files');

-- Создаем политику для удаления файлов
CREATE POLICY "Allow file deletions" ON storage.objects FOR DELETE USING (bucket_id = 'files');
