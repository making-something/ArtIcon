# 🎨 Frontend Implementation Details - Complete Code

**Purpose**: Complete, copy-paste ready code for frontend services and utilities  
**Use**: Copy each code block exactly as shown into the specified file

---

## 📋 Table of Contents

1. [Main Entry Point](#1-main-entry-point)
2. [App Component](#2-app-component)
3. [Global Styles](#3-global-styles)
4. [Security Utilities](#4-security-utilities)
5. [Updated Services](#5-updated-services)
6. [Protected Route Component](#6-protected-route-component)

---

## 1. Main Entry Point

### File: `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 2. App Component

### File: `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'

// Public Pages
import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'

// Admin Pages
import AdminLayout from '@/components/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import Participants from '@/pages/admin/Participants'
import Submissions from '@/pages/admin/Submissions'
import Winners from '@/pages/admin/Winners'
import Attendance from '@/pages/admin/Attendance'
import DriveSync from '@/pages/admin/DriveSync'
import Notifications from '@/pages/admin/Notifications'

// Participant Pages
import ParticipantPortal from '@/pages/participant/Portal'
import SubmitProject from '@/pages/participant/SubmitProject'
import MyQRCode from '@/pages/participant/MyQRCode'

// Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="participants" element={<Participants />} />
              <Route path="submissions" element={<Submissions />} />
              <Route path="winners" element={<Winners />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="drive-sync" element={<DriveSync />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Participant Routes */}
            <Route
              path="/participant"
              element={
                <ProtectedRoute requiredRole="participant">
                  <ParticipantPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/participant/submit"
              element={
                <ProtectedRoute requiredRole="participant">
                  <SubmitProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/participant/qr-code"
              element={
                <ProtectedRoute requiredRole="participant">
                  <MyQRCode />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

---

## 3. Global Styles

### File: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 4. Security Utilities

### File: `src/lib/security.ts`

```typescript
// Input sanitization
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

// Password validation
export function validatePasswordStrength(password: string) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const feedback: string[] = []
  let score = 0

  if (password.length >= minLength) score++
  else feedback.push(`At least ${minLength} characters`)

  if (hasUpperCase) score++
  else feedback.push('At least one uppercase letter')

  if (hasLowerCase) score++
  else feedback.push('At least one lowercase letter')

  if (hasNumbers) score++
  else feedback.push('At least one number')

  if (hasSpecialChar) score++
  else feedback.push('At least one special character')

  return {
    isValid: score >= 4,
    score,
    feedback,
  }
}

// Rate limiting (client-side)
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {}

export function isRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const record = rateLimitStore[key]

  if (!record || now > record.resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return false
  }

  if (record.count >= maxAttempts) {
    return true
  }

  record.count++
  return false
}

export function getRateLimitResetTime(key: string): number {
  const record = rateLimitStore[key]
  if (!record) return 0
  return Math.max(0, record.resetTime - Date.now())
}

// Session management
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`
}

export function setActiveSession(sessionId: string): void {
  localStorage.setItem('activeSession', sessionId)
  localStorage.setItem('lastActivity', Date.now().toString())
}

export function getActiveSession(): string | null {
  return localStorage.getItem('activeSession')
}

export function clearActiveSession(): void {
  localStorage.removeItem('activeSession')
  localStorage.removeItem('lastActivity')
}

export function updateSessionActivity(): void {
  localStorage.setItem('lastActivity', Date.now().toString())
}

export function isSessionExpired(timeoutMs: number = 30 * 60 * 1000): boolean {
  const lastActivity = localStorage.getItem('lastActivity')
  if (!lastActivity) return true
  return Date.now() - parseInt(lastActivity) > timeoutMs
}

export function clearSession(): void {
  clearActiveSession()
}

export function isActiveSession(sessionId: string): boolean {
  return getActiveSession() === sessionId
}
```

---

## 5. Updated Services

### File: `src/services/notificationService.ts`

```typescript
import api from '@/lib/api'

export interface EmailPayload {
  recipientEmail: string
  recipientName: string
  subject: string
  message: string
  notificationId: number
}

export interface WhatsAppPayload {
  recipientPhone: string
  recipientName: string
  message: string
  notificationId: number
}

export interface NotificationResult {
  success: boolean
  data?: any
  error?: string
}

// Send email via backend
export async function sendEmail(payload: EmailPayload): Promise<NotificationResult> {
  try {
    const response = await api.post('/api/notifications/send-email', payload)
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}

// Send WhatsApp via backend
export async function sendWhatsApp(payload: WhatsAppPayload): Promise<NotificationResult> {
  try {
    const response = await api.post('/api/notifications/send-whatsapp', payload)
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}

// Send both email and WhatsApp
export async function sendBoth(
  emailPayload: EmailPayload,
  whatsappPayload: WhatsAppPayload
): Promise<NotificationResult> {
  try {
    const [emailResult, whatsappResult] = await Promise.allSettled([
      sendEmail(emailPayload),
      sendWhatsApp(whatsappPayload),
    ])

    return {
      success: true,
      data: {
        email: emailResult.status === 'fulfilled' ? emailResult.value : null,
        whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : null,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// Process pending notifications
export async function processPendingNotifications(): Promise<NotificationResult> {
  try {
    const response = await api.post('/api/notifications/process-queue')
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}
```

### File: `src/services/driveService.ts`

```typescript
import api from '@/lib/api'

export interface DriveSyncPayload {
  sourceUrl: string
  participantName: string
  submissionId: string
}

export interface DriveSyncResult {
  success: boolean
  data?: any
  error?: string
}

// Sync single file via backend
export async function syncFile(payload: DriveSyncPayload): Promise<DriveSyncResult> {
  try {
    const response = await api.post('/api/drive/sync-file', payload)
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}

// Bulk sync all pending files
export async function bulkSync(): Promise<DriveSyncResult> {
  try {
    const response = await api.post('/api/drive/bulk-sync')
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}

// Get sync status
export async function getSyncStatus(submissionId: string): Promise<DriveSyncResult> {
  try {
    const response = await api.get(`/api/drive/sync-status/${submissionId}`)
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    }
  }
}

// Validate Drive link (client-side)
export function validateDriveLink(url: string): boolean {
  const drivePatterns = [
    /drive\.google\.com\/file\/d\//,
    /drive\.google\.com\/open\?id=/,
    /drive\.google\.com\/folders\//,
  ]
  return drivePatterns.some(pattern => pattern.test(url))
}

// Extract file ID (client-side)
export function extractDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/folders\/([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
```

---

## 6. Protected Route Component

### File: `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'participant' | 'judge'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, userRole } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

---

## 🎯 Implementation Checklist

After copying all code:

- [ ] All files created in correct locations
- [ ] No syntax errors
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Dev server starts successfully
- [ ] Can connect to backend API
- [ ] Supabase connection works
- [ ] Authentication works
- [ ] Services call backend correctly

---

## 📝 Next Steps

1. **Copy existing components** from old `hackathon-platform/src/components/`
2. **Copy existing pages** from old `hackathon-platform/src/pages/`
3. **Update imports** to use `@/` alias
4. **Test all features** to ensure they work with new backend
5. **Deploy frontend** to Vercel/Netlify

---

**Status**: ✅ READY TO IMPLEMENT  
**Note**: This provides the core infrastructure. You'll need to copy your existing UI components and pages from the old structure.

