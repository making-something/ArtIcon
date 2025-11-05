# 🎨 Frontend Setup Guide - Hackathon Platform

**Framework**: React 18 + TypeScript + Vite  
**Purpose**: User interface for participants, admins, and judges  
**Architecture**: Communicates with Backend API + Supabase (Auth & Database)

---

## 📋 Table of Contents

1. [Project Initialization](#1-project-initialization)
2. [Dependencies Installation](#2-dependencies-installation)
3. [Project Structure](#3-project-structure)
4. [Configuration Files](#4-configuration-files)
5. [Core Implementation](#5-core-implementation)
6. [Features Implementation](#6-features-implementation)
7. [Environment Setup](#7-environment-setup)
8. [Running the Project](#8-running-the-project)

---

## 1. Project Initialization

### Step 1.1: Create Vite Project

```bash
# Navigate to project root
cd hack-a-thone-platform

# Create frontend with Vite
npm create vite@latest frontend -- --template react-ts

# Navigate to frontend
cd frontend
```

### Step 1.2: Clean Up Default Files

```bash
# Remove default files we don't need
rm src/App.css
rm src/assets/react.svg
rm public/vite.svg
```

---

## 2. Dependencies Installation

### Step 2.1: Install Core Dependencies

```bash
npm install @supabase/supabase-js
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
npm install lucide-react
npm install clsx
npm install tailwind-merge
```

### Step 2.2: Install UI Dependencies

```bash
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-tooltip
npm install class-variance-authority
```

### Step 2.3: Install Dev Dependencies

```bash
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
npx tailwindcss init -p
```

---

## 3. Project Structure

### Step 3.1: Create Folder Structure

```bash
# Create all necessary folders
mkdir -p src/components/admin
mkdir -p src/components/participant
mkdir -p src/components/public
mkdir -p src/components/ui
mkdir -p src/pages/admin
mkdir -p src/pages/participant
mkdir -p src/pages/public
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils
```

### Step 3.2: Final Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   │   ├── AdminLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── participant/     # Participant-specific components
│   │   │   └── ParticipantNav.tsx
│   │   ├── public/          # Public components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/              # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── ...
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Participants.tsx
│   │   │   ├── Submissions.tsx
│   │   │   ├── Winners.tsx
│   │   │   ├── Attendance.tsx
│   │   │   ├── DriveSync.tsx
│   │   │   └── Notifications.tsx
│   │   ├── participant/     # Participant pages
│   │   │   ├── Portal.tsx
│   │   │   ├── SubmitProject.tsx
│   │   │   └── MyQRCode.tsx
│   │   └── public/          # Public pages
│   │       ├── Landing.tsx
│   │       ├── Login.tsx
│   │       └── Register.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/
│   │   ├── useAuth.ts       # Auth hook
│   │   └── useSecureAuth.ts # Secure auth with session management
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client (Auth + DB)
│   │   ├── api.ts           # Backend API client
│   │   ├── security.ts      # Security utilities
│   │   └── utils.ts         # General utilities
│   ├── services/
│   │   ├── notificationService.ts  # Calls backend for notifications
│   │   └── driveService.ts         # Calls backend for Drive sync
│   ├── types/
│   │   ├── database.types.ts       # Supabase types
│   │   └── api.types.ts            # API types
│   ├── utils/
│   │   └── helpers.ts       # Helper functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env.local               # Environment variables
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 4. Configuration Files

### Step 4.1: Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### Step 4.2: Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 4.3: Update `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
    },
  },
  plugins: [],
}
```

### Step 4.4: Create `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 5. Core Implementation

### Step 5.1: Create Supabase Client (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})
```

### Step 5.2: Create Backend API Client (`src/lib/api.ts`)

```typescript
import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach JWT token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Step 5.3: Create Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signOut: () => Promise<void>
  userRole: 'admin' | 'participant' | 'judge' | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'admin' | 'participant' | 'judge' | null>(null)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setUserRole(session?.user?.user_metadata?.role ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUserRole(session?.user?.user_metadata?.role ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    return result
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    return result
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, userRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

## 6. Features Implementation

### Step 6.1: Update Notification Service (`src/services/notificationService.ts`)

**OLD (Placeholder)**:
```typescript
// Placeholder - logs to console
export async function sendEmail(payload) {
  console.log('Sending email:', payload)
  return { success: true }
}
```

**NEW (Calls Backend)**:
```typescript
import api from '@/lib/api'

export async function sendEmail(payload: EmailPayload) {
  const response = await api.post('/api/notifications/send-email', payload)
  return response.data
}

export async function sendWhatsApp(payload: WhatsAppPayload) {
  const response = await api.post('/api/notifications/send-whatsapp', payload)
  return response.data
}

export async function processPendingNotifications() {
  const response = await api.post('/api/notifications/process-queue')
  return response.data
}
```

### Step 6.2: Update Drive Service (`src/services/driveService.ts`)

**OLD (Placeholder)**:
```typescript
// Placeholder - simulates sync
export async function syncFile(url: string) {
  console.log('Syncing file:', url)
  return { success: true }
}
```

**NEW (Calls Backend)**:
```typescript
import api from '@/lib/api'

export async function syncFile(sourceUrl: string, participantName: string, submissionId: string) {
  const response = await api.post('/api/drive/sync-file', {
    sourceUrl,
    participantName,
    submissionId,
  })
  return response.data
}

export async function bulkSync() {
  const response = await api.post('/api/drive/bulk-sync')
  return response.data
}

export async function getSyncStatus(submissionId: string) {
  const response = await api.get(`/api/drive/sync-status/${submissionId}`)
  return response.data
}
```

---

## 7. Environment Setup

### Step 7.1: Create `.env.example`

```env
# Supabase Configuration (Public - Safe for Frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API URL
VITE_BACKEND_API_URL=http://localhost:3000

# Environment
VITE_APP_ENV=development
```

### Step 7.2: Create `.env.local`

```bash
# Copy from example
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

**IMPORTANT**: Add to `.gitignore`:
```
.env.local
.env.production
```

---

## 8. Running the Project

### Step 8.1: Development Mode

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:5173
```

### Step 8.2: Build for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

### Step 8.3: Verify Setup

**Checklist**:
- [ ] Dev server starts without errors
- [ ] Can access http://localhost:5173
- [ ] Supabase connection works
- [ ] Backend API connection works (when backend is running)
- [ ] No console errors
- [ ] Routing works
- [ ] Authentication works

---

## 🎯 Next Steps

After completing this setup:

1. **Copy existing components** from `hackathon-platform/src/` to `frontend/src/`
2. **Update imports** to use `@/` alias
3. **Update services** to call backend API
4. **Test all features** to ensure they work
5. **Deploy frontend** to Vercel/Netlify

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Status**: ✅ READY TO IMPLEMENT  
**Estimated Time**: 2-3 hours  
**Difficulty**: Medium

