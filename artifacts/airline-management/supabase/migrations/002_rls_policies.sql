-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (is_admin());

-- ROLES
CREATE POLICY "Authenticated users can view roles" ON roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage roles" ON roles FOR ALL USING (is_admin());

-- DEPARTMENTS
CREATE POLICY "Authenticated users can view departments" ON departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (is_admin());

-- EMPLOYEES
CREATE POLICY "Authenticated users can view employees" ON employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can insert employees" ON employees FOR INSERT WITH CHECK (is_manager());
CREATE POLICY "Managers can update employees" ON employees FOR UPDATE USING (is_manager());
CREATE POLICY "Admins can delete employees" ON employees FOR DELETE USING (is_admin());

-- AIRCRAFT
CREATE POLICY "Authenticated users can view aircraft" ON aircraft FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage aircraft" ON aircraft FOR ALL USING (is_manager());

-- ROUTES
CREATE POLICY "Authenticated users can view routes" ON routes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage routes" ON routes FOR ALL USING (is_manager());

-- FLIGHTS
CREATE POLICY "Authenticated users can view flights" ON flights FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can insert flights" ON flights FOR INSERT WITH CHECK (is_manager());
CREATE POLICY "Managers can update flights" ON flights FOR UPDATE USING (is_manager());
CREATE POLICY "Admins can delete flights" ON flights FOR DELETE USING (is_admin());

-- CREW
CREATE POLICY "Authenticated users can view crew" ON crew FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage crew" ON crew FOR ALL USING (is_manager());

-- CREW ASSIGNMENTS
CREATE POLICY "Authenticated users can view crew assignments" ON crew_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage crew assignments" ON crew_assignments FOR ALL USING (is_manager());

-- MAINTENANCE
CREATE POLICY "Authenticated users can view maintenance" ON maintenance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can manage maintenance" ON maintenance FOR ALL USING (is_manager());

-- NOTIFICATIONS: users only see their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ATTENDANCE
CREATE POLICY "Managers can view all attendance" ON attendance FOR SELECT USING (is_manager());
CREATE POLICY "Employees view own attendance" ON attendance FOR SELECT USING (
  employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);
CREATE POLICY "Managers can manage attendance" ON attendance FOR ALL USING (is_manager());

-- LEAVE REQUESTS
CREATE POLICY "Employees can view own leave requests" ON leave_requests FOR SELECT USING (
  employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid()) OR is_manager()
);
CREATE POLICY "Employees can insert own leave requests" ON leave_requests FOR INSERT WITH CHECK (
  employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);
CREATE POLICY "Managers can update leave requests" ON leave_requests FOR UPDATE USING (is_manager());

-- ACTIVITY LOGS
CREATE POLICY "Admins can view all activity logs" ON activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity logs" ON activity_logs FOR INSERT WITH CHECK (TRUE);
