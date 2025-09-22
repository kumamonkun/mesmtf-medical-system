"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, Activity, AlertTriangle, Download } from "lucide-react"

const diseaseData = [
  { name: "Malaria", cases: 45, percentage: 60 },
  { name: "Typhoid", cases: 25, percentage: 33 },
  { name: "Both", cases: 5, percentage: 7 },
]

const monthlyData = [
  { month: "Jan", malaria: 12, typhoid: 8, both: 2 },
  { month: "Feb", malaria: 15, typhoid: 10, both: 1 },
  { month: "Mar", malaria: 18, typhoid: 7, both: 2 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

interface StatisticalReportsProps {
  searchTerm: string
}

export function StatisticalReports({ searchTerm }: StatisticalReportsProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">75</div>
            <p className="text-xs text-muted-foreground">Currently under treatment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Disease Distribution</CardTitle>
            <CardDescription>Current cases by disease type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={diseaseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cases"
                >
                  {diseaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Cases reported over the last 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="malaria" fill="#0088FE" name="Malaria" />
                <Bar dataKey="typhoid" fill="#00C49F" name="Typhoid" />
                <Bar dataKey="both" fill="#FFBB28" name="Both" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Treatment Outcomes</CardTitle>
            <CardDescription>Success rates by disease type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Malaria</Badge>
                <span className="text-sm">Success Rate</span>
              </div>
              <span className="font-bold text-green-600">96.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Typhoid</Badge>
                <span className="text-sm">Success Rate</span>
              </div>
              <span className="font-bold text-green-600">91.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Combined</Badge>
                <span className="text-sm">Success Rate</span>
              </div>
              <span className="font-bold text-green-600">88.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>AI diagnosis accuracy and system metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Diagnosis Accuracy</span>
              <span className="font-bold text-blue-600">92.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Diagnosis Time</span>
              <span className="font-bold">2.3 minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System Uptime</span>
              <span className="font-bold text-green-600">99.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Satisfaction</span>
              <span className="font-bold text-green-600">4.7/5.0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Download statistical reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Monthly Report (PDF)
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Disease Statistics (Excel)
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Treatment Outcomes (CSV)
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              System Analytics (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
