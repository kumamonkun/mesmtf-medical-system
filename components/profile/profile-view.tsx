"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Activity,
  FileText,
  Calendar as CalendarIcon,
  Pill
} from "lucide-react"
import { toast } from "sonner"

interface ProfileViewProps {
  user: any
  profile: any
}

export function ProfileView({ user, profile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    address: profile.address || '',
    specialization: profile.specialization || ''
  })

  const getSidebarItems = () => {
    if (user.role === "patient") {
      return [
        { icon: <User className="h-4 w-4" />, label: "My Profile", href: "/profile", active: true },
        { icon: <CalendarIcon className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
        { icon: <FileText className="h-4 w-4" />, label: "Medical Records", href: "/records" },
        { icon: <Pill className="h-4 w-4" />, label: "Prescriptions", href: "/prescriptions" },
      ]
    }

    return [
      { icon: <User className="h-4 w-4" />, label: "Profile", href: "/profile", active: true },
      { icon: <Activity className="h-4 w-4" />, label: "Dashboard", href: "/dashboard" },
    ]
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile)
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
        // Refresh the page or update the profile state
        window.location.reload()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditedProfile({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      specialization: profile.specialization || ''
    })
    setIsEditing(false)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

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

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={`${profile.first_name} ${profile.last_name}`} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.first_name, profile.last_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              <div className="flex justify-center">
                {getRoleBadge(profile.role)}
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{profile.address}</span>
                </div>
              )}
              {profile.specialization && (
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.specialization}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="account">Account Settings</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={isEditing ? editedProfile.first_name : profile.first_name || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, first_name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={isEditing ? editedProfile.last_name : profile.last_name || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, last_name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editedProfile.email : profile.email || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={isEditing ? editedProfile.phone : profile.phone || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={isEditing ? editedProfile.address : profile.address || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                    {profile.role === 'doctor' && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={isEditing ? editedProfile.specialization : profile.specialization || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, specialization: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="account" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input value={profile.username || ''} disabled />
                      <p className="text-sm text-muted-foreground">
                        Username cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(profile.role)}
                        <span className="text-sm text-muted-foreground">
                          Contact administrator to change role
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <Input 
                        value={new Date(profile.created_at).toLocaleDateString()} 
                        disabled 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Updated</Label>
                      <Input 
                        value={new Date(profile.updated_at).toLocaleDateString()} 
                        disabled 
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Activity Log</h3>
                    <p className="text-muted-foreground">
                      Your recent activity will appear here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
