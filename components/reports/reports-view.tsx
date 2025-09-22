"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, BarChart3 } from "lucide-react"
import { MedicalReports } from "./medical-reports"
import { StatisticalReports } from "./statistical-reports"
import { PrescriptionReports } from "./prescription-reports"

export function ReportsView() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive medical reports and system analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics Dashboard
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reports, patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="medical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medical">Medical Reports</TabsTrigger>
          <TabsTrigger value="statistical">Statistical Reports</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescription Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="medical">
          <MedicalReports searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="statistical">
          <StatisticalReports searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionReports searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
