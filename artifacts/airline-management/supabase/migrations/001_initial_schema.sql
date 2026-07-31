-- ============================================================
-- AIRLINE MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEPARTMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id),
  department_id UUID REFERENCES departments(id),
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMPLOYEES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_number TEXT UNIQUE NOT NULL,
  profile_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department_id UUID REFERENCES departments(id),
  role_id UUID REFERENCES roles(id),
  job_title TEXT NOT NULL,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated', 'on_leave')),
  hire_date DATE NOT NULL,
  salary DECIMAL(12, 2),
  address TEXT,
  emergency_contact JSONB,
  certifications JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AIRCRAFT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  cargo_capacity_kg DECIMAL(10, 2),
  fuel_capacity_liters DECIMAL(12, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'grounded', 'retired')),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  total_flight_hours DECIMAL(10, 2) DEFAULT 0,
  year_manufactured INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROUTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_code TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  distance_km DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(origin_code, destination_code)
);

-- ============================================================
-- FLIGHTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number TEXT NOT NULL,
  aircraft_id UUID REFERENCES aircraft(id),
  route_id UUID REFERENCES routes(id),
  captain_id UUID REFERENCES employees(id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  actual_departure TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled', 'diverted')),
  gate TEXT,
  terminal TEXT,
  passenger_count INTEGER DEFAULT 0,
  available_seats INTEGER,
  delay_minutes INTEGER DEFAULT 0,
  delay_reason TEXT,
  cancellation_reason TEXT,
  fuel_used_liters DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREW TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS crew (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  crew_type TEXT NOT NULL CHECK (crew_type IN ('pilot', 'co_pilot', 'flight_attendant', 'purser', 'ground_crew')),
  license_number TEXT,
  license_expiry DATE,
  ratings JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREW ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS crew_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crew(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flight_id, crew_id)
);

-- ============================================================
-- MAINTENANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aircraft_id UUID REFERENCES aircraft(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('routine', 'emergency', 'scheduled', 'overhaul')),
  description TEXT NOT NULL,
  technician_id UUID REFERENCES employees(id),
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  cost DECIMAL(12, 2),
  parts_used JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('flight_delay', 'maintenance_due', 'crew_assignment', 'employee_registered', 'password_changed', 'flight_cancelled', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ============================================================
-- LEAVE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES employees(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_aircraft ON flights(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_flight ON crew_assignments(flight_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_aircraft ON maintenance(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_aircraft_updated_at BEFORE UPDATE ON aircraft FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_flights_updated_at BEFORE UPDATE ON flights FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_crew_updated_at BEFORE UPDATE ON crew FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_crew_assignments_updated_at BEFORE UPDATE ON crew_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_maintenance_updated_at BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
