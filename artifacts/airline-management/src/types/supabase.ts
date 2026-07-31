export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role_id: string | null
          department_id: string | null
          phone: string | null
          is_active: boolean
          dark_mode: boolean
          language: string
          notification_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      employees: {
        Row: {
          id: string
          employee_number: string
          profile_id: string | null
          full_name: string
          email: string
          phone: string | null
          department_id: string | null
          role_id: string | null
          job_title: string
          employment_type: 'full_time' | 'part_time' | 'contract' | 'intern'
          status: 'active' | 'suspended' | 'terminated' | 'on_leave'
          hire_date: string
          salary: number | null
          address: string | null
          emergency_contact: Json | null
          certifications: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      flights: {
        Row: {
          id: string
          flight_number: string
          aircraft_id: string | null
          route_id: string | null
          captain_id: string | null
          departure_time: string
          arrival_time: string
          actual_departure: string | null
          actual_arrival: string | null
          status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled' | 'diverted'
          gate: string | null
          terminal: string | null
          passenger_count: number
          available_seats: number | null
          delay_minutes: number
          delay_reason: string | null
          cancellation_reason: string | null
          fuel_used_liters: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['flights']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['flights']['Insert']>
      }
      aircraft: {
        Row: {
          id: string
          registration: string
          model: string
          manufacturer: string
          capacity: number
          cargo_capacity_kg: number | null
          fuel_capacity_liters: number | null
          status: 'active' | 'maintenance' | 'grounded' | 'retired'
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          total_flight_hours: number
          year_manufactured: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['aircraft']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['aircraft']['Insert']>
      }
      routes: {
        Row: {
          id: string
          origin_code: string
          origin_city: string
          destination_code: string
          destination_city: string
          distance_km: number | null
          estimated_duration_minutes: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['routes']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['routes']['Insert']>
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['roles']['Insert']>
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['departments']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['departments']['Insert']>
      }
      crew: {
        Row: {
          id: string
          employee_id: string
          crew_type: 'pilot' | 'co_pilot' | 'flight_attendant' | 'purser' | 'ground_crew'
          license_number: string | null
          license_expiry: string | null
          ratings: Json
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['crew']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['crew']['Insert']>
      }
      crew_assignments: {
        Row: {
          id: string
          flight_id: string
          crew_id: string
          role: string
          status: 'pending' | 'confirmed' | 'cancelled'
          assigned_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['crew_assignments']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['crew_assignments']['Insert']>
      }
      maintenance: {
        Row: {
          id: string
          aircraft_id: string
          maintenance_type: 'routine' | 'emergency' | 'scheduled' | 'overhaul'
          description: string
          technician_id: string | null
          scheduled_date: string
          completed_date: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          cost: number | null
          parts_used: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenance']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['maintenance']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'flight_delay' | 'maintenance_due' | 'crew_assignment' | 'employee_registered' | 'password_changed' | 'flight_cancelled' | 'system'
          title: string
          message: string
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          date: string
          check_in: string | null
          check_out: string | null
          status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid'
          start_date: string
          end_date: string
          reason: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
