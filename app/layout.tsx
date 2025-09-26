import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MESMTF - Medical Expert System",
  description: "Medical Expert System for Malaria and Typhoid Fever - Ministry of Health and Social Services",
  generator: "MESMTF v1.0",
  formatDetection: {
    telephone: false,
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        
        {/* Botpress AI Diagnosis Chatbot */}
        <script src="https://cdn.botpress.cloud/webchat/v3.2/inject.js" defer></script>
        <script src="https://files.bpcontent.cloud/2025/09/25/12/20250925123930-03190S7Z.js" defer></script>
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
