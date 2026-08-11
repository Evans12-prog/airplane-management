import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuthContext } from '@/contexts/AuthContext';
import { canAccessEmployees } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [activateId, setActivateId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { profile, loading: authLoading } = useAuthContext();

  useEffect(() => {
    if (!authLoading && !canAccessEmployees(profile)) {
      setLocation('/');
    }
  }, [profile, authLoading, setLocation]);

  const { employees, loading: employeesLoading, deleteEmployee, suspendEmployee, activateEmployee } = useEmployees(
    {
      status: statusFilter,
      search: searchQuery,
    },
    profile,
  );

  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }
    if (searchQuery) {
      result = result.filter(
        (e) =>
          e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.employee_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [employees, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      all: employees.length,
      active: employees.filter((e) => e.status === 'active').length,
      suspended: employees.filter((e) => e.status === 'suspended').length,
      on_leave: employees.filter((e) => e.status === 'on_leave').length,
      terminated: employees.filter((e) => e.status === 'terminated').length,
    };
  }, [employees]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsProcessing(true);
    try {
      await deleteEmployee(deleteId);
      toast.success('Employee deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete employee');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendId) return;
    setIsProcessing(true);
    try {
      await suspendEmployee(suspendId);
      toast.success('Employee suspended');
      setSuspendId(null);
    } catch (error) {
      toast.error('Failed to suspend employee');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async () => {
    if (!activateId) return;
    setIsProcessing(true);
    try {
      await activateEmployee(activateId);
      toast.success('Employee activated');
      setActivateId(null);
    } catch (error) {
      toast.error('Failed to activate employee');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Employee Directory</h2>
          <p className="text-sm text-muted-foreground">Manage airline staff and crew members</p>
        </div>
        <Button data-testid="button-add-employee" onClick={() => setLocation('/employees/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger value="suspended" data-testid="tab-suspended">
              Suspended ({statusCounts.suspended})
            </TabsTrigger>
            <TabsTrigger value="on_leave" data-testid="tab-on-leave">
              On Leave ({statusCounts.on_leave})
            </TabsTrigger>
            <TabsTrigger value="terminated" data-testid="tab-terminated">
              Terminated ({statusCounts.terminated})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-employees"
          />
        </div>
      </div>

      {/* Table */}
      {employeesLoading ? (
        <TableSkeleton rows={10} />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No employees found"
          description={
            searchQuery ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first employee'
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-card-border rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Employee #</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Department</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Hire Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-right py-4 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                    data-testid={`row-employee-${employee.id}`}
                  >
                    <td className="py-4 px-4 font-mono font-semibold text-foreground">{employee.employee_number}</td>
                    <td className="py-4 px-4 font-medium text-foreground">{employee.full_name}</td>
                    <td className="py-4 px-4 text-muted-foreground">{employee.email}</td>
                    <td className="py-4 px-4 text-muted-foreground">{employee.departments?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-muted-foreground">{employee.job_title}</td>
                    <td className="py-4 px-4 text-muted-foreground capitalize">
                      {employee.employment_type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {format(new Date(employee.hire_date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={employee.status} type="employee" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setLocation(`/employees/edit/${employee.id}`)}
                          data-testid={`button-edit-${employee.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {employee.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-600 hover:text-orange-600"
                            onClick={() => setSuspendId(employee.id)}
                            data-testid={`button-suspend-${employee.id}`}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {employee.status === 'suspended' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-600"
                            onClick={() => setActivateId(employee.id)}
                            data-testid={`button-activate-${employee.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(employee.id)}
                          data-testid={`button-delete-${employee.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isProcessing}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!suspendId}
        onOpenChange={(open) => !open && setSuspendId(null)}
        title="Suspend Employee"
        description="Are you sure you want to suspend this employee? They will not be able to access the system."
        onConfirm={handleSuspend}
        loading={isProcessing}
      />

      <ConfirmDialog
        open={!!activateId}
        onOpenChange={(open) => !open && setActivateId(null)}
        title="Activate Employee"
        description="Are you sure you want to reactivate this employee?"
        onConfirm={handleActivate}
        loading={isProcessing}
      />
    </div>
  );
}
