/**
 * MESMTF - Medical Expert System for Malaria and Typhoid Fever
 * 
 * Main Layout Component
 * 
 * This is the root layout component that wraps the entire application.
 * It provides:
 * - Global font configuration (Inter)
 * - Authentication context for all pages
 * - Toast notifications system
 * - Analytics tracking
 * - Botpress AI chatbot integration
 * - Global CSS styles
 * 
 * @author Ministry of Health and Social Services
 * @version 1.0.0
 */

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"
import "./globals.css"

// Configure Inter font for the entire application
// This provides consistent typography across all components
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// SEO and metadata configuration for the medical system
// This helps with search engine optimization and social media sharing
export const metadata: Metadata = {
  title: "MESMTF - Medical Expert System",
  description: "Medical Expert System for Malaria and Typhoid Fever - Ministry of Health and Social Services",
  generator: "MESMTF v1.0",
  formatDetection: {
    telephone: false, // Disable automatic phone number detection
  },
  openGraph: {
    type: "website",
    siteName: "MESMTF",
    title: "MESMTF - Medical Expert System",
    description: "Medical Expert System for Malaria and Typhoid Fever - Ministry of Health and Social Services",
  },
  twitter: {
    card: "summary",
    title: "MESMTF - Medical Expert System",
    description: "Medical Expert System for Malaria and Typhoid Fever - Ministry of Health and Social Services",
  },
}

// Viewport configuration for mobile responsiveness
// Ensures the app works well on all device sizes
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming for medical accuracy
}

/**
 * Root Layout Component
 * 
 * This is the main layout wrapper that provides:
 * - HTML structure with proper language setting
 * - Favicon links for browser tabs
 * - Botpress AI chatbot integration for medical diagnosis
 * - Authentication context for the entire app
 * - Toast notifications for user feedback
 * - Analytics tracking for usage monitoring
 * 
 * @param children - The page content to be rendered
 * @returns The complete HTML structure with all providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon configuration for browser tabs */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        
        {/* Botpress AI Diagnosis Chatbot Integration */}
        {/* This provides AI-powered medical diagnosis capabilities */}
        <script src="https://cdn.botpress.cloud/webchat/v3.2/inject.js" defer></script>
        <script src="https://files.bpcontent.cloud/2025/09/25/12/20250925123930-03190S7Z.js" defer></script>
      </head>
      <body className={`font-sans ${inter.variable}`}>
        {/* Authentication Provider - Manages user login/logout and role-based access */}
        <AuthProvider>
          {/* Suspense wrapper for loading states */}
          <Suspense fallback={null}>{children}</Suspense>
          
          {/* Toast notification system for user feedback */}
          <Toaster />
          
          {/* Analytics tracking for usage monitoring */}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
