"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import { DrugInventory } from "./drug-inventory"
import { PrescriptionManagement } from "./prescription-management"
import { DrugAdministration } from "./drug-administration"
import DrugInteractions from "./drug-interactions"

export function PharmacyView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("inventory")
  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['inventory', 'prescriptions', 'administration', 'interactions'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pharmacy Management</h1>
          <p className="text-muted-foreground">Manage medications, prescriptions, and drug administration</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Drug
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search drugs, prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Drug Inventory</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="administration">Drug Administration</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <DrugInventory searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionManagement searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="administration">
          <DrugAdministration searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="interactions">
          <DrugInteractions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
