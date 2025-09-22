"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/common/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone: string
  role: 'patient' | 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin'
  specialization: string
  address: string
  created_at: string
  updated_at: string
}

interface UsersViewProps {
  user: any
}

export function UsersView({ user }: UsersViewProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/profiles')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.profiles || [])
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getSidebarItems = () => {
    return [
      { icon: <Users className="h-4 w-4" />, label: "User Management", href: "/users", active: true },
      { icon: <Shield className="h-4 w-4" />, label: "System Overview", href: "/overview" },
      { icon: <Calendar className="h-4 w-4" />, label: "System Data", href: "/data" },
      { icon: <Mail className="h-4 w-4" />, label: "Settings", href: "/settings" },
    ]
  }

  const filteredUsers = users.filter(userProfile => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      userProfile.first_name.toLowerCase().includes(searchLower) ||
      userProfile.last_name.toLowerCase().includes(searchLower) ||
      userProfile.email.toLowerCase().includes(searchLower) ||
      userProfile.username.toLowerCase().includes(searchLower) ||
      userProfile.role.toLowerCase().includes(searchLower)
    )
    
    const matchesRole = roleFilter === "all" || userProfile.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const roleColors = {
      patient: "bg-blue-100 text-blue-800",
      doctor: "bg-green-100 text-green-800",
      nurse: "bg-purple-100 text-purple-800",
      pharmacist: "bg-orange-100 text-orange-800",
      receptionist: "bg-pink-100 text-pink-800",
      admin: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getStatusBadge = (userProfile: UserProfile) => {
    const lastUpdate = new Date(userProfile.updated_at)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate < 7) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    } else if (daysSinceUpdate < 30) {
      return <Badge variant="secondary">Inactive</Badge>
    } else {
      return <Badge variant="destructive">Dormant</Badge>
    }
  }

  const columns: Column<UserProfile>[] = [
    {
      key: "user",
      title: "User",
      sortable: true,
      render: (userProfile) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={`${userProfile.first_name} ${userProfile.last_name}`} />
            <AvatarFallback>
              {getInitials(userProfile.first_name, userProfile.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{userProfile.first_name} {userProfile.last_name}</div>
            <div className="text-sm text-muted-foreground">@{userProfile.username}</div>
          </div>
        </div>
      )
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
      render: (userProfile) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-sm">
            <Mail className="h-3 w-3" />
            <span>{userProfile.email}</span>
          </div>
          {userProfile.phone && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{userProfile.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: "role",
      title: "Role",
      sortable: true,
      render: (userProfile) => (
        <div className="space-y-1">
          {getRoleBadge(userProfile.role)}
          {userProfile.specialization && (
            <div className="text-xs text-muted-foreground">
              {userProfile.specialization}
            </div>
          )}
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (userProfile) => getStatusBadge(userProfile)
    },
    {
      key: "created",
      title: "Created",
      sortable: true,
      render: (userProfile) => (
        <div className="text-sm">
          {new Date(userProfile.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (userProfile) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const getRoleStats = () => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return stats
  }

  const roleStats = getRoleStats()

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">User Management</h1>
            <p className="text-muted-foreground">
              Manage system users and their roles
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">All users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-green-500" />
                Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.patient || 0}</div>
              <p className="text-xs text-muted-foreground">Patient accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2 text-purple-500" />
                Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.doctor || 0}</div>
              <p className="text-xs text-muted-foreground">Medical staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-orange-500" />
                Nurses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.nurse || 0}</div>
              <p className="text-xs text-muted-foreground">Nursing staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-pink-500" />
                Pharmacists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.pharmacist || 0}</div>
              <p className="text-xs text-muted-foreground">Pharmacy staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.admin || 0}</div>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                  <option value="nurse">Nurses</option>
                  <option value="pharmacist">Pharmacists</option>
                  <option value="receptionist">Receptionists</option>
                  <option value="admin">Admins</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredUsers}
              columns={columns}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
