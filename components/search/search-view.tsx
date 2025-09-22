"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter } from "lucide-react"
import { PatientSearch } from "./patient-search"
import { DoctorSearch } from "./doctor-search"
import { MedicationSearch } from "./medication-search"
import { AppointmentSearch } from "./appointment-search"

export function SearchView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Global Search</h1>
          <p className="text-muted-foreground">
            Search across all system data - patients, doctors, medications, and appointments
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients, doctors, medications, appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-lg py-6"
          />
        </div>
        <Button size="lg">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <PatientSearch searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="doctors">
          <DoctorSearch searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="medications">
          <MedicationSearch searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentSearch searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
