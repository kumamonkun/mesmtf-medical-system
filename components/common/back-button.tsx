/**
 * MESMTF Back Button Component
 * 
 * A reusable back navigation button that provides intelligent routing
 * based on user role and browser history.
 * 
 * Features:
 * - Smart fallback routing based on user role
 * - Browser history navigation when available
 * - Customizable appearance and behavior
 * - Role-aware routing for medical system users
 * 
 * @author Ministry of Health and Social Services
 * @version 1.0.0
 */

"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

/**
 * Back Button Props Interface
 * 
 * Defines the configuration options for the back button component.
 */
interface BackButtonProps {
  fallbackPath?: string  // Custom fallback path when no browser history
  className?: string     // Additional CSS classes
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link"  // Button style variant
  size?: "default" | "sm" | "lg" | "icon"  // Button size
  showText?: boolean     // Whether to show "Back" text alongside icon
}

/**
 * Back Button Component
 * 
 * Renders a back navigation button with intelligent routing logic.
 * Uses browser history when available, falls back to role-based routing.
 * 
 * @param props - BackButtonProps configuration object
 * @returns A back navigation button component
 */
export function BackButton({ 
  fallbackPath, 
  className = "",
  variant = "ghost",
  size = "icon",
  showText = false
}: BackButtonProps) {
  const router = useRouter()
  const { profile } = useAuth()

  /**
   * Handle back navigation with smart routing logic
   * 
   * Priority:
   * 1. Use browser history if available
   * 2. Use custom fallback path if provided
   * 3. Use role-based fallback to appropriate dashboard
   * 4. Default to main dashboard
   */
  const handleBack = () => {
    // Check if there's browser history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // If no history, determine the appropriate fallback path
      let defaultFallback = "/dashboard"
      
      if (fallbackPath) {
        // Use provided custom fallback path
        defaultFallback = fallbackPath
      } else if (profile?.role) {
        // Role-based fallback paths - all roles go to dashboard
        // but dashboard component shows different content based on role
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
