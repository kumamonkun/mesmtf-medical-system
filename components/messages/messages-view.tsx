"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Plus,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  content: string
  is_read: boolean
  created_at: string
  sender_name?: string
  sender_role?: string
}

interface MessagesViewProps {
  user: any
}

export function MessagesView({ user }: MessagesViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipient: ''
  })
  const [showCompose, setShowCompose] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      // Fetch messages where user is either sender or receiver
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          subject,
          content,
          is_read,
          created_at,
          sender:sender_id(
            first_name,
            last_name,
            role
          ),
          receiver:receiver_id(
            first_name,
            last_name,
            role
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
        return
      }

      // Transform the data to match our interface
      const transformedMessages: Message[] = messagesData?.map(message => ({
        id: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        subject: message.subject,
        content: message.content,
        is_read: message.is_read,
        created_at: message.created_at,
        sender_name: message.sender ? `${message.sender.first_name} ${message.sender.last_name}` : 'Unknown',
        sender_role: message.sender?.role || 'unknown'
      })) || []

      setMessages(transformedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const getSidebarItems = () => {
    return [
      { icon: <MessageSquare className="h-4 w-4" />, label: "Messages", href: "/messages", active: true },
      { icon: <User className="h-4 w-4" />, label: "My Profile", href: "/profile" },
      { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
      { icon: <Mail className="h-4 w-4" />, label: "Medical Records", href: "/records" },
    ]
  }

  const filteredMessages = messages.filter(message => {
    const searchLower = searchTerm.toLowerCase()
    return (
      message.subject.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower) ||
      message.sender_name?.toLowerCase().includes(searchLower)
    )
  })

  const unreadCount = messages.filter(m => !m.is_read).length

  const getRoleBadge = (role: string) => {
    const roleColors = {
      doctor: "bg-green-100 text-green-800",
      nurse: "bg-purple-100 text-purple-800",
      pharmacist: "bg-orange-100 text-orange-800",
      admin: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
  }

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields')
      return
    }
    
    try {
      // For now, we'll send to admin as default recipient
      // In a real implementation, you'd have a user selection interface
      const { data: adminUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'admin')
        .single()

      if (!adminUser) {
        toast.error('No admin user found')
        return
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: adminUser.id,
          subject: newMessage.subject,
          content: newMessage.content,
          is_read: false,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error sending message:', error)
        toast.error('Failed to send message')
        return
      }

      toast.success('Message sent successfully')
      setNewMessage({ subject: '', content: '', recipient: '' })
      setShowCompose(false)
      
      // Refresh messages
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) {
        console.error('Error marking message as read:', error)
        return
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      )
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with your healthcare team
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={() => setShowCompose(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">All messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">New messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Read
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length - unreadCount}</div>
              <p className="text-xs text-muted-foreground">Read messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages by subject, content, or sender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="p-4 text-center">Loading messages...</div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No messages found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                          !message.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => {
                          setSelectedMessage(message)
                          handleMarkAsRead(message.id)
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={message.sender_name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(message.sender_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {message.sender_name}
                              </p>
                              <div className="flex items-center space-x-1">
                                {getRoleBadge(message.sender_role || 'staff')}
                                {!message.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-medium text-foreground truncate">
                              {message.subject}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {message.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(message.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card className="lg:col-span-2">
            {selectedMessage ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={selectedMessage.sender_name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(selectedMessage.sender_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{selectedMessage.sender_name}</p>
                          <div className="flex items-center space-x-2">
                            {getRoleBadge(selectedMessage.sender_role || 'staff')}
                            <span className="text-xs text-muted-foreground">
                              {new Date(selectedMessage.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a message</h3>
                  <p className="text-muted-foreground">
                    Choose a message from the list to view its content
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Compose Message Dialog */}
        {showCompose && (
          <Card className="fixed inset-4 z-50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  placeholder="Select recipient..."
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Message subject..."
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
