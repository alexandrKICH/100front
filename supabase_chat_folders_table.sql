-- SQL Script to create chat_folders table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chat_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  chat_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_chat_folders_user_id ON chat_folders(user_id);

-- Add comment
COMMENT ON TABLE chat_folders IS 'Stores user-created folders for organizing chats';
