# 100GRAM Frontend

Next.js приложение для мессенджера 100GRAM.

## Features

- 💬 Текстовые сообщения
- 📞 Голосовые/видео звонки
- 👥 Групповые чаты
- 📁 Обмен файлами
- 🔐 Анонимная регистрация
- 🌐 Real-time обновления (Socket.IO)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development

```bash
npm install
npm run dev
```

Откройте http://localhost:5000

## Production Build

```bash
npm run build
npm start
```

## Static Export (для Capacitor)

```bash
npm run export
```

## Android APK

1. Инициализация:
```bash
npm run android:init
```

2. Синхронизация:
```bash
npm run android:sync
```

3. Открыть в Android Studio:
```bash
npm run android:open
```

4. Или собрать напрямую:
```bash
npm run android:build
```

APK файл: `android/app/build/outputs/apk/debug/app-debug.apk`

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Socket.IO Client
- Capacitor (для мобильных приложений)
