"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, type Column } from "@/components/common/data-table"
import { AddPatientDialog } from "./add-patient-dialog"
import { useMedicalRecords } from "@/hooks/use-api"
import {
  FileText,
  Search,
  Plus,
  Filter,
  Calendar,
  Phone,
  MapPin,
  Activity,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  User,
  Download,
  RefreshCw
} from "lucide-react"
import { type MedicalRecord, type Patient } from "@/lib/types/api"

interface MedicalRecordsViewProps {
  user: any
}

export function MedicalRecordsView({ user }: MedicalRecordsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("records")
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Use the new API hook for medical records
  const { 
    data: medicalRecordsData, 
    loading: recordsLoading, 
    error: recordsError, 
    execute: fetchRecords 
  } = useMedicalRecords()

  // Use the new API hook for patients
  const { 
    data: patientsData, 
    loading: patientsLoading, 
    error: patientsError, 
    execute: fetchPatients 
  } = useMedicalRecords() // This should be usePatients() when implemented

  // Fetch data on component mount
  useEffect(() => {
    fetchRecords({ search: searchTerm })
  }, [searchTerm, fetchRecords])

  // Define columns for the medical records table
  const medicalRecordColumns: Column<MedicalRecord>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium max-w-[200px] truncate" title={value as string}>
          {value}
        </div>
      )
    },
    {
      key: 'patient.first_name',
      label: 'Patient',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            {row.patient ? `${row.patient.first_name} ${row.patient.last_name}` : 'N/A'}
            {row.patient && (
              <div className="text-xs text-muted-foreground">
                ID: {row.patient.patient_id}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'record_type',
      label: 'Type',
      sortable: true,
      render: (value) => {
        const typeColors = {
          consultation: 'bg-blue-100 text-blue-800',
          diagnosis: 'bg-green-100 text-green-800',
          treatment: 'bg-purple-100 text-purple-800',
          lab_result: 'bg-yellow-100 text-yellow-800',
          imaging: 'bg-indigo-100 text-indigo-800',
          prescription: 'bg-pink-100 text-pink-800',
          vaccination: 'bg-teal-100 text-teal-800',
          surgery: 'bg-red-100 text-red-800',
          emergency: 'bg-orange-100 text-orange-800',
          follow_up: 'bg-cyan-100 text-cyan-800',
          other: 'bg-gray-100 text-gray-800'
        }
        return (
          <Badge className={typeColors[value as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
            {value?.toString().replace('_', ' ').toUpperCase()}
          </Badge>
        )
      }
    },
    {
      key: 'visit_date',
      label: 'Visit Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(value as string).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => {
        const priorityColors = {
          low: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-orange-100 text-orange-800',
          urgent: 'bg-red-100 text-red-800'
        }
        return value ? (
          <Badge className={priorityColors[value as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}>
            {value?.toString().toUpperCase()}
          </Badge>
        ) : '-'
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          draft: 'bg-gray-100 text-gray-800',
          active: 'bg-green-100 text-green-800',
          archived: 'bg-blue-100 text-blue-800',
          deleted: 'bg-red-100 text-red-800'
        }
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
            {value?.toString().toUpperCase()}
          </Badge>
        )
      }
    },
    {
      key: 'doctor.name',
      label: 'Doctor',
      sortable: true,
      render: (value, row) => (
        <div>
          {row.doctor ? row.doctor.name : 'N/A'}
          {row.doctor?.specialty && (
            <div className="text-xs text-muted-foreground">
              {row.doctor.specialty}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center space-x-1">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  // Define columns for the patients table
  const patientColumns: Column<Patient>[] = [
    {
      key: 'first_name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.first_name} {row.last_name}</div>
            <div className="text-xs text-muted-foreground">ID: {row.patient_id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="flex items-center space-x-1">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{value}</span>
          </div>
          {row.email && (
            <div className="text-xs text-muted-foreground">{row.email}</div>
          )}
        </div>
      )
    },
    {
      key: 'date_of_birth',
      label: 'Age',
      sortable: true,
      render: (value) => {
        const age = new Date().getFullYear() - new Date(value as string).getFullYear()
        return (
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{age} years</span>
          </div>
        )
      }
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'blood_type',
      label: 'Blood Type',
      sortable: true,
      render: (value) => value ? (
        <Badge variant="secondary">{value}</Badge>
      ) : '-'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          critical: 'bg-red-100 text-red-800'
        }
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
            {value?.toString().toUpperCase()}
          </Badge>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center space-x-1">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting data...')
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
            <p className="text-muted-foreground">
              Comprehensive patient medical records and information management
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search patients, records..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
          </TabsList>

          <TabsContent value="records">
            <DataTable
              data={medicalRecordsData?.data?.medicalRecords || []}
              columns={medicalRecordColumns}
              loading={recordsLoading}
              searchable
              filterable
              pagination={medicalRecordsData?.data?.pagination ? {
                page: medicalRecordsData.data.pagination.page,
                limit: medicalRecordsData.data.pagination.limit,
                total: medicalRecordsData.data.pagination.total,
                totalPages: medicalRecordsData.data.pagination.totalPages,
                onPageChange: (page) => fetchRecords({ page, search: searchTerm }),
                onLimitChange: (limit) => fetchRecords({ limit, search: searchTerm })
              } : undefined}
              onRefresh={() => fetchRecords({ search: searchTerm })}
              onExport={handleExport}
              searchPlaceholder="Search medical records..."
              emptyMessage="No medical records found"
            />
          </TabsContent>

          <TabsContent value="patients">
            <DataTable
              data={patientsData?.data?.patients || []}
              columns={patientColumns}
              loading={patientsLoading}
              searchable
              filterable
              pagination={patientsData?.data?.pagination ? {
                page: patientsData.data.pagination.page,
                limit: patientsData.data.pagination.limit,
                total: patientsData.data.pagination.total,
                totalPages: patientsData.data.pagination.totalPages,
                onPageChange: (page) => fetchPatients({ page, search: searchTerm }),
                onLimitChange: (limit) => fetchPatients({ limit, search: searchTerm })
              } : undefined}
              onRefresh={() => fetchPatients({ search: searchTerm })}
              onExport={handleExport}
              searchPlaceholder="Search patients..."
              emptyMessage="No patients found"
            />
          </TabsContent>
        </Tabs>

        {/* Add Patient Dialog */}
        {showAddDialog && (
          <AddPatientDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onSuccess={() => {
              fetchPatients()
              setShowAddDialog(false)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
