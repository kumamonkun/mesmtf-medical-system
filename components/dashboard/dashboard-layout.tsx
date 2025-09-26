"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Activity, LogOut, Menu, Search, X, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface DashboardLayoutProps {
  user: {
    username: string
    role: string
    loginTime: string
  }
  children: React.ReactNode
  sidebarItems: Array<{
    icon: React.ReactNode
    label: string
    href: string
    active?: boolean
  }>
  showBackButton?: boolean
  backButtonHref?: string
}

export function DashboardLayout({ user, children, sidebarItems, showBackButton = false, backButtonHref = "/dashboard" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("mesmtf_user")
    router.push("/")
  }

  const handleLogoClick = () => {
    router.push("/dashboard")
  }

  const handleBackClick = () => {
    router.push(backButtonHref)
  }

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, " $1")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" className="md:hidden mr-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>

          {showBackButton && (
            <Button variant="ghost" size="sm" className="mr-2" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm border">
              <Image
                src="/logo-48706.jpg"
                alt="MESMTF Logo"
                width={24}
                height={24}
                className="rounded-md object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">MESMTF</h1>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients, doctors, drugs..." className="pl-10" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{formatRole(user.role)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4 md:hidden">
              <span className="text-lg font-semibold">Menu</span>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 space-y-2 p-4">
              {sidebarItems.map((item, index) => (
                <Button
                  key={index}
                  variant={item.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </nav>

          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
