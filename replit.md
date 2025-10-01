# 100GRAM - Anonymous Messenger

## Overview

100GRAM is a professional anonymous messaging application with separated backend and frontend architecture. The backend is built with Express.js and Socket.IO, while the frontend uses Next.js and React. The project is designed for deployment on Render (backend) and Vercel (frontend), with support for creating Android APK files via Capacitor.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Structure

```
├── backend/          # Express API сервер (Render)
│   ├── src/
│   │   ├── routes/   # API маршруты
│   │   ├── lib/      # Утилиты и Supabase клиент
│   │   └── index.ts  # Главный файл сервера
│   ├── package.json
│   └── .env.example
│
├── frontend/         # Next.js приложение (Vercel)
│   ├── app/          # Next.js страницы
│   ├── components/   # React компоненты
│   ├── lib/          # API клиент и утилиты
│   ├── package.json
│   ├── capacitor.config.ts  # Конфигурация для APK
│   └── .env.example
│
├── DEPLOYMENT_GUIDE.md  # Полное руководство по деплою
└── README.md
```

## System Architecture

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Real-time**: Socket.IO for WebSocket connections
- **Database**: Supabase PostgreSQL (все запросы через backend)
- **API**: REST API с эндпоинтами для auth, contacts, groups, messages, calls, files, folders
- **Deployment**: Render.com

### Frontend Architecture
- **Framework**: Next.js 14 with React 18, utilizing TypeScript
- **UI Components**: Radix UI primitives alongside custom shadcn/ui components
- **Styling**: Tailwind CSS, featuring a professional light theme with clean gradients
- **State Management**: React hooks for local state and context providers
- **API Client**: Кастомный клиент для взаимодействия с backend API
- **Real-time**: Socket.IO Client для live обновлений
- **Modular Design**: Componentized architecture for reusability
- **Responsive Design**: Mobile-friendly bottom-sheet modals that adapt to desktop dialogs
- **Mobile**: Capacitor для создания APK
- **Deployment**: Vercel

### Authentication & User Management
- **Anonymous System**: Minimal information required for registration (login, password, display name).
- **Authentication**: Simple hash-based authentication.
- **Profile Management**: Avatar uploads, status messages, and user customization with persistent data storage.

### Communication Features
- **Messaging**: Real-time text messaging, supporting professional conversations.
- **Group Chats**: Multi-user conversations with administrative controls.
- **File Sharing**: Support for various file types (images, documents, audio, video).
- **Contact System**: Friend requests and contact management.
- **Notification System**: In-app notifications, browser push notifications, and unread message counters.

### Data Storage Solutions
- **Primary Database**: Supabase with PostgreSQL backend (accessed через backend API)
- **File Storage**: Supabase Storage for media and avatars (через backend)
- **Real-time Sync**: Socket.IO для live message synchronization и online status
- **Local Storage**: Used for user preferences, settings, and chat persistence (e.g., selected chat, folder data)

### Media Handling
- **File Upload**: Drag-and-drop uploads with validation.
- **Image Processing**: Avatar resizing.

### System Design Choices
- **Clean Professional Design**: Emphasizes a minimalist, Telegram-inspired light theme. All premium features, badges, and excessive decorative elements have been removed to maintain focus on core functionality.
- **Folder System**: Telegram-style chat folder organization, allowing users to create, edit, and delete custom folders, and filter chat lists. Folder data is persisted in the database.
- **Accessibility**: All dialog modals meet WCAG accessibility standards with proper descriptions.
- **Performance**: Optimized message loading with visual indicators and reduced redundant database checks.

## External Dependencies

- **Next.js**: React framework for production applications.
- **React**: Library for building user interfaces.
- **TypeScript**: For type-safe development.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Headless UI components for accessibility.
- **Lucide React**: Icon library.
- **Class Variance Authority**: For managing component variants.
- **Supabase**: Backend-as-a-Service, providing PostgreSQL database, real-time features, and file storage.
- **React Hook Form**: For form handling and validation.
- **Date-fns**: For date manipulation.
- **Embla Carousel**: Carousel component.
- **Immer**: For immutable state updates.

## Recent Changes

### September 30, 2025 - Backend/Frontend Separation
- **Project Structure**: Разделен проект на backend/ и frontend/ директории
- **Backend API**: Создан Express сервер с REST API для всех операций
  - Routes: auth, contacts, groups, messages, calls, files, folders
  - Socket.IO интеграция для real-time коммуникации
  - Все запросы к Supabase перенесены в backend
- **Frontend API Client**: Создан кастомный API клиент (lib/api.ts, lib/database-api.ts)
  - Socket.IO client для WebSocket соединений
  - Обертки над всеми сервисами для работы с backend
- **Deployment Configuration**:
  - Backend: настроен для деплоя на Render (render.yaml)
  - Frontend: настроен для деплоя на Vercel (vercel.json)
  - Capacitor: добавлена поддержка для создания Android APK
- **Documentation**: Создано полное руководство по деплою (DEPLOYMENT_GUIDE.md)
- **Environment Variables**: Настроены .env.example файлы для обоих частей проекта

### September 30, 2025 (Latest) - Message Delivery and Contact List Fix
- **Message Delivery to New Recipients**: Fixed issue where messages sent to users found via search didn't appear in recipient's chat list
  - Modified `getContacts` function in lib/database.ts to load users from both explicit contacts AND active private chats
  - Now queries `chat_participants` table to find all users with whom current user has active chats
  - Recipients now see senders in their contact list immediately, even if they haven't explicitly added them
  - Maintains backward compatibility by prioritizing explicit contacts and filtering duplicates
  - Performance optimized with only 2 additional queries (user chats + participants), avoiding N+1 query pattern

### September 30, 2025 - Message and Profile Bug Fixes
- **Message Duplication Fix**: Fixed issue where sent messages appeared twice in the chat interface
  - Removed optimistic message append from `handleSendMessage` in app/page.tsx
  - Messages now only added to UI via realtime subscription (single source of truth)
  - Ensures reliable message delivery and prevents duplicate renders
- **Profile "About me" Persistence**: Fixed issue where "About me" text was not saved in database
  - Removed `status` field overwrites in `authService.login` and `authService.logout` (lib/database.ts)
  - Removed `status` field overwrite in `restoreSession` (app/page.tsx)
  - Changed initial `status` value from "online" to empty string in registration and default state
  - The `status` field now exclusively stores user's "About me" text
  - Online/offline status tracked via separate `is_online` boolean field
  - "About me" text now persists correctly across login, logout, and page refresh

### October 1, 2025 - Critical Performance Optimizations and Call Feature Removal
- **Webpack Caching Fix**: Resolved slow build times and crashes
  - Disabled webpack caching in next.config.mjs to eliminate cache invalidation errors
  - Fixed "Invalid URL" errors caused by Supabase credential issues
  - Application now compiles cleanly in ~17 seconds instead of crashing
- **Message Loading Optimization**: Dramatically improved chat switching speed
  - Implemented in-memory message cache (messagesCache) for instant chat switching
  - Added batch last message loading (messageService.getBatchLastMessages) to load all last messages at once
  - Background fetching prevents UI blocking during message loads
  - Reduced database queries from multiple per-chat to single batch query
- **Real-time Subscription Optimization**: Eliminated redundant database queries
  - Streamlined Supabase real-time subscription to use single global listener
  - Uses selectedChatRef to avoid stale closures and redundant re-subscriptions
  - Removed 2 extra Supabase queries per incoming message (contact lookup and last message fetch)
  - Messages now update instantly without additional database round-trips
- **Session Persistence Fix**: Resolved logout on page refresh issue
  - Implemented workaround for swapped Replit environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are mislabeled in secrets)
  - Code in frontend/lib/supabase.ts swaps them back to correct values
  - Users now stay logged in after page refresh
- **Call Feature Removal**: Completely removed voice/video call functionality as requested
  - Removed all call UI components (buttons, modals, notifications)
  - Removed call state management and event handlers from main app
  - Removed call-related real-time subscriptions
  - Cleaned up unused call imports and dependencies
  - Note: Backend call routes and unused frontend call files remain but are not active in the application