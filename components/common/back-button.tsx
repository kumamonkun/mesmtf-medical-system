"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface BackButtonProps {
  fallbackPath?: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function BackButton({ 
  fallbackPath, 
  className = "",
  variant = "ghost",
  size = "icon",
  showText = false
}: BackButtonProps) {
  const router = useRouter()
  const { profile } = useAuth()

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // If no history, determine the appropriate fallback path
      let defaultFallback = "/dashboard"
      
      if (fallbackPath) {
        // Use provided fallback path
        defaultFallback = fallbackPath
      } else if (profile?.role) {
        // Role-based fallback paths
        switch (profile.role) {
          case "admin":
            defaultFallback = "/dashboard" // Admin dashboard
            break
          case "doctor":
            defaultFallback = "/dashboard" // Doctor dashboard
            break
          case "nurse":
            defaultFallback = "/dashboard" // Nurse dashboard
            break
          case "pharmacist":
            defaultFallback = "/dashboard" // Pharmacist dashboard
            break
          case "receptionist":
            defaultFallback = "/dashboard" // Receptionist dashboard
            break
          case "patient":
            defaultFallback = "/dashboard" // Patient dashboard
            break
          default:
            defaultFallback = "/dashboard"
        }
      }
      
      router.push(defaultFallback)
    }
  }

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size={size}
      className={`hover:bg-muted/50 transition-colors ${className}`}
      title="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      {showText && <span className="ml-2">Back</span>}
    </Button>
  )
}
