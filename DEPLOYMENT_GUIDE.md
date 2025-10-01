# 🚀 Руководство по деплою 100GRAM

Проект разделен на **backend** и **frontend** для деплоя на разных платформах.

## 📁 Структура проекта

```
├── backend/          # Express API сервер (для Render)
├── frontend/         # Next.js приложение (для Vercel)
└── DEPLOYMENT_GUIDE.md
```

## 🔧 Backend (Render)

### Настройка переменных окружения

Создайте `.env` файл в папке `backend/`:

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Деплой на Render

1. Зайдите на [render.com](https://render.com)
2. Создайте новый **Web Service**
3. Подключите ваш репозиторий
4. Укажите настройки:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Добавьте переменные окружения из `.env`
6. Деплой!

**URL backend**: `https://your-backend.onrender.com`

---

## 🎨 Frontend (Vercel)

### Настройка переменных окружения

Создайте `.env.local` файл в папке `frontend/`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Импортируйте ваш репозиторий
3. Укажите настройки:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Добавьте переменные окружения:
   - `NEXT_PUBLIC_API_URL` = URL вашего backend на Render
5. Деплой!

**URL frontend**: `https://your-app.vercel.app`

---

## 📱 Создание APK файла (Android)

### Требования
- Node.js 18+
- Android Studio
- Java JDK 17

### Шаги

1. **Инициализация Capacitor:**
```bash
cd frontend
npm install
npm run android:init
```

2. **Настройка переменных окружения для продакшена:**

Обновите `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

3. **Билд и синхронизация:**
```bash
npm run export
npm run android:sync
```

4. **Открыть Android Studio:**
```bash
npm run android:open
```

5. **Собрать APK в Android Studio:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK будет в `android/app/build/outputs/apk/debug/`

### Или через командную строку:
```bash
npm run android:build
```

APK файл: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔗 Связь Frontend и Backend

После деплоя обновите переменные окружения:

**На Render (Backend):**
- `FRONTEND_URL` = URL вашего Vercel деплоя

**На Vercel (Frontend):**
- `NEXT_PUBLIC_API_URL` = URL вашего Render деплоя

---

## 🧪 Локальная разработка

### Backend
```bash
cd backend
npm install
npm run dev
```
Сервер: http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Приложение: http://localhost:5000

---

## 📝 Заметки

- **WebSocket**: Socket.IO настроен для real-time коммуникации
- **CORS**: Уже настроен между frontend и backend
- **Supabase**: Backend использует Supabase напрямую, frontend через API
- **APK**: Для production APK нужен подписанный keystore
- **Безопасность**: Пароли хэшируются с помощью bcryptjs (10 rounds)

### ⚠️ Важно: Миграция паролей

Если у вас есть существующие пользователи с старыми хэшами паролей:
1. При первом входе после деплоя пользователи с старыми хэшами не смогут войти
2. Рекомендуется сбросить все пароли и попросить пользователей создать новые
3. Или реализовать миграцию: при входе проверять старый хэш, если подходит - сохранить новый bcrypt хэш

---

## 🆘 Помощь

Если возникли проблемы:
1. Проверьте переменные окружения
2. Убедитесь, что backend доступен с frontend
3. Проверьте CORS настройки
4. Посмотрите логи на Render и Vercel
