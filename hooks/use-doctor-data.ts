import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DoctorStats {
  todayPatients: number
  pendingDiagnoses: number
  activeTreatments: number
  criticalCases: number
}

interface Appointment {
  id: string
  patient_name: string
  reason: string
  appointment_date: string
  status: string
  room?: string
}

interface Diagnosis {
  id: string
  patient_name: string
  diagnosis: string
  treatment: string
  status: string
}

interface Alert {
  id: string
  patient_id: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  created_at: string
}

export function useDoctorData(doctorId: string) {
  const [stats, setStats] = useState<DoctorStats>({
    todayPatients: 0,
    pendingDiagnoses: 0,
    activeTreatments: 0,
    criticalCases: 0
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!doctorId) return

    const fetchDoctorData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch today's appointments
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            reason,
            appointment_date,
            status,
            patients!inner(
              first_name,
              last_name
            )
          `)
          .eq('doctor_id', doctorId)
          .gte('appointment_date', today.toISOString())
          .lt('appointment_date', tomorrow.toISOString())
          .order('appointment_date', { ascending: true })

        if (appointmentsError) throw appointmentsError

        // Fetch pending diagnoses
        const { data: diagnosesData, error: diagnosesError } = await supabase
          .from('diagnoses')
          .select(`
            id,
            diagnosis,
            doctor_notes,
            patients!inner(
              first_name,
              last_name
            )
          `)
          .eq('doctor_id', doctorId)
          .is('diagnosis', null) // Pending diagnoses

        if (diagnosesError) throw diagnosesError

        // Fetch active treatments
        const { data: treatmentsData, error: treatmentsError } = await supabase
          .from('treatments')
          .select('id')
          .eq('status', 'active')

        if (treatmentsError) throw treatmentsError

        // Fetch critical cases (patients with high priority conditions)
        const { data: criticalData, error: criticalError } = await supabase
          .from('diagnoses')
          .select(`
            id,
            patients!inner(
              first_name,
              last_name
            )
          `)
          .eq('doctor_id', doctorId)
          .in('diagnosis', ['Malaria', 'Typhoid Fever'])
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

        if (criticalError) throw criticalError

        // Process appointments data
        const processedAppointments: Appointment[] = (appointmentsData || []).map(apt => ({
          id: apt.id,
          patient_name: `${apt.patients.first_name} ${apt.patients.last_name}`,
          reason: apt.reason || 'No reason provided',
          appointment_date: apt.appointment_date,
          status: apt.status,
          room: `Room ${Math.floor(Math.random() * 10) + 100}` // Mock room assignment
        }))

        // Process diagnoses data
        const processedDiagnoses: Diagnosis[] = (diagnosesData || []).map(diag => ({
          id: diag.id,
          patient_name: `${diag.patients.first_name} ${diag.patients.last_name}`,
          diagnosis: diag.diagnosis || 'Pending',
          treatment: diag.doctor_notes || 'Treatment pending',
          status: diag.diagnosis ? 'Confirmed' : 'Pending'
        }))

        // Process alerts (mock data for now)
        const mockAlerts: Alert[] = [
          {
            id: '1',
            patient_id: 'P-2025-001',
            message: 'High fever (104°F) - Requires immediate attention',
            severity: 'critical',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            patient_id: 'P-2025-015',
            message: 'Medication allergy noted - Review prescription',
            severity: 'warning',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ]

        // Update state
        setStats({
          todayPatients: appointmentsData?.length || 0,
          pendingDiagnoses: diagnosesData?.length || 0,
          activeTreatments: treatmentsData?.length || 0,
          criticalCases: criticalData?.length || 0
        })

        setAppointments(processedAppointments)
        setDiagnoses(processedDiagnoses)
        setAlerts(mockAlerts)

      } catch (err) {
        console.error('Error fetching doctor data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [doctorId, supabase])

  return {
    stats,
    appointments,
    diagnoses,
    alerts,
    loading,
    error,
    refetch: () => {
      if (doctorId) {
        setLoading(true)
        // Trigger refetch by updating a dependency
        setStats(prev => ({ ...prev }))
      }
    }
  }
}
