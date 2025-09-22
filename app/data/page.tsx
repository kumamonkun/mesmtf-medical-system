"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Users, Calendar, FileText, Pill, Activity, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAdminStats } from "@/hooks/use-admin-data"

export default function DataPage() {
  const { user, profile } = useAuth()
  const { stats: adminStats, loading, error } = useAdminStats()

  if (!user || !profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { icon: <Database className="h-4 w-4" />, label: "System Data", href: "/data", active: true },
    { icon: <Users className="h-4 w-4" />, label: "Overview", href: "/dashboard" },
    { icon: <Users className="h-4 w-4" />, label: "User Management", href: "/users" },
    { icon: <BarChart3 className="h-4 w-4" />, label: "System Reports", href: "/reports" },
  ]

  const userData = {
    username: profile.username,
    role: profile.role,
    loginTime: new Date().toISOString(),
  }

  const dataCategories = [
    {
      title: "Patients",
      count: adminStats?.roleCounts?.patients || 0,
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Patient records and information"
    },
    {
      title: "Appointments",
      count: adminStats?.appointmentStats?.total || 0,
      icon: <Calendar className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Scheduled and completed appointments"
    },
    {
      title: "Doctors",
      count: adminStats?.roleCounts?.doctors || 0,
      icon: <FileText className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Medical doctors and specialists"
    },
    {
      title: "Nurses",
      count: adminStats?.roleCounts?.nurses || 0,
      icon: <Activity className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Nursing staff"
    },
    {
      title: "Pharmacists",
      count: adminStats?.roleCounts?.pharmacists || 0,
      icon: <Pill className="h-6 w-6" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Pharmacy staff"
    },
    {
      title: "Receptionists",
      count: adminStats?.roleCounts?.receptionists || 0,
      icon: <Database className="h-6 w-6" />,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      description: "Administrative staff"
    },
    {
      title: "Total Users",
      count: adminStats?.totalUsers || 0,
      icon: <BarChart3 className="h-6 w-6" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "All system users"
    }
  ]

  return (
    <DashboardLayout 
      user={userData} 
      sidebarItems={sidebarItems}
      showBackButton={true}
      backButtonHref="/dashboard"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Data Management</h1>
          <p className="text-gray-600">View and manage all system data</p>
        </div>

        {/* Data Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Overview
            </CardTitle>
            <CardDescription>
              Current status of all data in the MESMTF system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <p className="text-destructive">Error loading data: {error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataCategories.map((category, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${category.bgColor}`}>
                        <div className={category.color}>
                          {category.icon}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {category.count}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Patient Data
              </CardTitle>
              <CardDescription>Manage patient records and information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/patients'}>
                View Patients
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Appointments
              </CardTitle>
              <CardDescription>Manage appointment scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/appointments'}>
                View Appointments
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Medical Records
              </CardTitle>
              <CardDescription>View and manage medical records</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/records'}>
                View Records
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2 text-red-600" />
                Pharmacy
              </CardTitle>
              <CardDescription>Manage drugs and prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/pharmacy'}>
                View Pharmacy
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Reports
              </CardTitle>
              <CardDescription>Generate and view system reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/reports'}>
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-teal-600" />
                Database
              </CardTitle>
              <CardDescription>Database management and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Database Tools
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}