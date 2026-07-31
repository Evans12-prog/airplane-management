-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO roles (id, name, description, permissions) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Super Administrator with full access', '{"all": true}'),
  ('00000000-0000-0000-0000-000000000002', 'admin', 'Administrator', '{"manage_users": true, "manage_flights": true, "manage_employees": true, "view_analytics": true}'),
  ('00000000-0000-0000-0000-000000000003', 'manager', 'Operations Manager', '{"manage_flights": true, "manage_employees": true, "view_analytics": true}'),
  ('00000000-0000-0000-0000-000000000004', 'pilot', 'Flight Captain/Pilot', '{"view_flights": true, "view_crew": true}'),
  ('00000000-0000-0000-0000-000000000005', 'crew', 'Flight Crew Member', '{"view_flights": true}'),
  ('00000000-0000-0000-0000-000000000006', 'staff', 'General Staff', '{"view_own_data": true}')
ON CONFLICT (name) DO NOTHING;

-- Departments
INSERT INTO departments (id, name, description) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Flight Operations', 'Manages all flight operations'),
  ('00000000-0000-0000-0001-000000000002', 'Cabin Crew', 'Flight attendants and cabin staff'),
  ('00000000-0000-0000-0001-000000000003', 'Ground Operations', 'Ground handling and logistics'),
  ('00000000-0000-0000-0001-000000000004', 'Engineering', 'Aircraft maintenance and engineering'),
  ('00000000-0000-0000-0001-000000000005', 'Human Resources', 'HR and employee management'),
  ('00000000-0000-0000-0001-000000000006', 'Finance', 'Financial management'),
  ('00000000-0000-0000-0001-000000000007', 'Customer Service', 'Passenger services')
ON CONFLICT (name) DO NOTHING;

-- Aircraft
INSERT INTO aircraft (id, registration, model, manufacturer, capacity, fuel_capacity_liters, status, total_flight_hours, year_manufactured) VALUES
  ('00000000-0000-0001-0000-000000000001', 'ZS-GAA', 'Boeing 737-800', 'Boeing', 162, 26022, 'active', 15420.5, 2018),
  ('00000000-0000-0001-0000-000000000002', 'ZS-GAB', 'Boeing 737-800', 'Boeing', 162, 26022, 'active', 12890.0, 2019),
  ('00000000-0000-0001-0000-000000000003', 'ZS-GAC', 'Airbus A320', 'Airbus', 150, 24210, 'active', 8730.5, 2020),
  ('00000000-0000-0001-0000-000000000004', 'ZS-GAD', 'Airbus A320', 'Airbus', 150, 24210, 'maintenance', 22100.0, 2016),
  ('00000000-0000-0001-0000-000000000005', 'ZS-GAE', 'Boeing 787-9', 'Boeing', 296, 126920, 'active', 6500.0, 2021)
ON CONFLICT (registration) DO NOTHING;

-- Routes
INSERT INTO routes (id, origin_code, origin_city, destination_code, destination_city, distance_km, estimated_duration_minutes) VALUES
  ('00000000-0000-0002-0000-000000000001', 'JNB', 'Johannesburg', 'CPT', 'Cape Town', 1404, 105),
  ('00000000-0000-0002-0000-000000000002', 'CPT', 'Cape Town', 'JNB', 'Johannesburg', 1404, 105),
  ('00000000-0000-0002-0000-000000000003', 'JNB', 'Johannesburg', 'DUR', 'Durban', 566, 70),
  ('00000000-0000-0002-0000-000000000004', 'DUR', 'Durban', 'JNB', 'Johannesburg', 566, 70),
  ('00000000-0000-0002-0000-000000000005', 'JNB', 'Johannesburg', 'NBO', 'Nairobi', 3452, 225),
  ('00000000-0000-0002-0000-000000000006', 'JNB', 'Johannesburg', 'LOS', 'Lagos', 5040, 315),
  ('00000000-0000-0002-0000-000000000007', 'CPT', 'Cape Town', 'DUR', 'Durban', 1675, 125),
  ('00000000-0000-0002-0000-000000000008', 'JNB', 'Johannesburg', 'GRJ', 'George', 740, 85)
ON CONFLICT (origin_code, destination_code) DO NOTHING;

-- Employees (sample data — profile_id will be linked when users sign up)
INSERT INTO employees (id, employee_number, full_name, email, phone, department_id, role_id, job_title, employment_type, status, hire_date, salary) VALUES
  ('00000000-0001-0000-0000-000000000001', 'EMP001', 'Captain James Osei', 'j.osei@skyair.co.za', '+27-11-555-0101', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000004', 'Senior Captain', 'full_time', 'active', '2015-03-01', 85000),
  ('00000000-0001-0000-0000-000000000002', 'EMP002', 'Captain Sarah Boateng', 's.boateng@skyair.co.za', '+27-11-555-0102', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000004', 'Captain', 'full_time', 'active', '2017-06-15', 78000),
  ('00000000-0001-0000-0000-000000000003', 'EMP003', 'Michael Mensah', 'm.mensah@skyair.co.za', '+27-11-555-0103', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000005', 'Cabin Crew Supervisor', 'full_time', 'active', '2018-09-01', 45000),
  ('00000000-0001-0000-0000-000000000004', 'EMP004', 'Ama Asante', 'a.asante@skyair.co.za', '+27-11-555-0104', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000005', 'Flight Attendant', 'full_time', 'active', '2020-01-10', 38000),
  ('00000000-0001-0000-0000-000000000005', 'EMP005', 'Kwame Adjei', 'k.adjei@skyair.co.za', '+27-11-555-0105', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000003', 'Chief Engineer', 'full_time', 'active', '2013-05-20', 92000),
  ('00000000-0001-0000-0000-000000000006', 'EMP006', 'Abena Owusu', 'a.owusu@skyair.co.za', '+27-11-555-0106', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000003', 'HR Manager', 'full_time', 'active', '2016-11-01', 68000),
  ('00000000-0001-0000-0000-000000000007', 'EMP007', 'Samuel Tetteh', 's.tetteh@skyair.co.za', '+27-11-555-0107', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000005', 'Ground Operations Lead', 'full_time', 'active', '2019-03-15', 52000),
  ('00000000-0001-0000-0000-000000000008', 'EMP008', 'Akosua Nyarko', 'a.nyarko@skyair.co.za', '+27-11-555-0108', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000005', 'Flight Attendant', 'full_time', 'on_leave', '2021-07-01', 36000)
ON CONFLICT (employee_number) DO NOTHING;

-- Crew records linked to employees
INSERT INTO crew (id, employee_id, crew_type, license_number, license_expiry, is_available) VALUES
  ('00000000-0002-0000-0000-000000000001', '00000000-0001-0000-0000-000000000001', 'pilot', 'ATP-2015-001', '2026-03-01', TRUE),
  ('00000000-0002-0000-0000-000000000002', '00000000-0001-0000-0000-000000000002', 'pilot', 'ATP-2017-002', '2026-06-15', TRUE),
  ('00000000-0002-0000-0000-000000000003', '00000000-0001-0000-0000-000000000003', 'purser', NULL, NULL, TRUE),
  ('00000000-0002-0000-0000-000000000004', '00000000-0001-0000-0000-000000000004', 'flight_attendant', NULL, NULL, TRUE),
  ('00000000-0002-0000-0000-000000000005', '00000000-0001-0000-0000-000000000008', 'flight_attendant', NULL, NULL, FALSE)
ON CONFLICT DO NOTHING;

-- Flights (upcoming + recent)
INSERT INTO flights (id, flight_number, aircraft_id, route_id, captain_id, departure_time, arrival_time, status, gate, terminal, passenger_count, available_seats, delay_minutes) VALUES
  ('00000000-0003-0000-0000-000000000001', 'SA101', '00000000-0000-0001-0000-000000000001', '00000000-0000-0002-0000-000000000001', '00000000-0001-0000-0000-000000000001', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours 45 minutes', 'scheduled', 'A12', 'Terminal A', 145, 17, 0),
  ('00000000-0003-0000-0000-000000000002', 'SA102', '00000000-0000-0001-0000-000000000002', '00000000-0000-0002-0000-000000000002', '00000000-0001-0000-0000-000000000002', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '5 hours 45 minutes', 'scheduled', 'B05', 'Terminal B', 138, 24, 0),
  ('00000000-0003-0000-0000-000000000003', 'SA201', '00000000-0000-0001-0000-000000000003', '00000000-0000-0002-0000-000000000003', '00000000-0001-0000-0000-000000000001', NOW() + INTERVAL '6 hours', NOW() + INTERVAL '7 hours 10 minutes', 'scheduled', 'C03', 'Terminal C', 120, 30, 0),
  ('00000000-0003-0000-0000-000000000004', 'SA301', '00000000-0000-0001-0000-000000000005', '00000000-0000-0002-0000-000000000005', '00000000-0001-0000-0000-000000000002', NOW() + INTERVAL '8 hours', NOW() + INTERVAL '11 hours 45 minutes', 'scheduled', 'D01', 'Terminal D', 265, 31, 0),
  ('00000000-0003-0000-0000-000000000005', 'SA103', '00000000-0000-0001-0000-000000000001', '00000000-0000-0002-0000-000000000001', '00000000-0001-0000-0000-000000000001', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour 15 minutes', 'arrived', 'A08', 'Terminal A', 162, 0, 0),
  ('00000000-0003-0000-0000-000000000006', 'SA202', '00000000-0000-0001-0000-000000000002', '00000000-0000-0002-0000-000000000004', '00000000-0001-0000-0000-000000000002', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '10 minutes', 'delayed', 'B09', 'Terminal B', 142, 8, 45)
ON CONFLICT DO NOTHING;

-- Maintenance records
INSERT INTO maintenance (id, aircraft_id, maintenance_type, description, technician_id, scheduled_date, status, cost) VALUES
  ('00000000-0004-0000-0000-000000000001', '00000000-0000-0001-0000-000000000004', 'overhaul', 'Full engine overhaul and inspection', '00000000-0001-0000-0000-000000000005', CURRENT_DATE, 'in_progress', 125000),
  ('00000000-0004-0000-0000-000000000002', '00000000-0000-0001-0000-000000000001', 'scheduled', 'A-Check inspection', '00000000-0001-0000-0000-000000000005', CURRENT_DATE + INTERVAL '7 days', 'scheduled', 18500),
  ('00000000-0004-0000-0000-000000000003', '00000000-0000-0001-0000-000000000003', 'routine', 'Monthly safety check', '00000000-0001-0000-0000-000000000005', CURRENT_DATE + INTERVAL '14 days', 'scheduled', 3500),
  ('00000000-0004-0000-0000-000000000004', '00000000-0000-0001-0000-000000000002', 'routine', 'Pre-flight inspection completed', '00000000-0001-0000-0000-000000000005', CURRENT_DATE - INTERVAL '3 days', 'completed', 2800)
ON CONFLICT DO NOTHING;

-- Enable Supabase Realtime on notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE flights;
