"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import { TreatmentPlans } from "./treatment-plans"
import { TreatmentHistory } from "./treatment-history"

export function TreatmentView() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Treatment Management</h1>
          <p className="text-muted-foreground">Manage patient treatment plans and medical interventions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Treatment Plan
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients, treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Treatment Plans</TabsTrigger>
          <TabsTrigger value="history">Treatment History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <TreatmentPlans searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="history">
          <TreatmentHistory searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
