import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Clock } from 'lucide-react';
import { useFlights } from '@/hooks/useFlights';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FlightsPage() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { flights, loading, deleteFlight, updateFlight } = useFlights({
    status: statusFilter,
    search: searchQuery,
  });

  const filteredFlights = useMemo(() => {
    let result = flights;
    if (statusFilter !== 'all') {
      result = result.filter((f) => f.status === statusFilter);
    }
    if (searchQuery) {
      result = result.filter((f) => f.flight_number.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [flights, statusFilter, searchQuery]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteFlight(deleteId);
      toast.success('Flight deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete flight');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateFlight(id, { status: newStatus as any });
      toast.success('Flight status updated');
    } catch (error) {
      toast.error('Failed to update flight status');
    }
  };

  const statusCounts = useMemo(() => {
    return {
      all: flights.length,
      scheduled: flights.filter((f) => f.status === 'scheduled').length,
      boarding: flights.filter((f) => f.status === 'boarding').length,
      departed: flights.filter((f) => f.status === 'departed').length,
      arrived: flights.filter((f) => f.status === 'arrived').length,
      delayed: flights.filter((f) => f.status === 'delayed').length,
      cancelled: flights.filter((f) => f.status === 'cancelled').length,
    };
  }, [flights]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flight Management</h2>
          <p className="text-sm text-muted-foreground">Manage all flight operations and schedules</p>
        </div>
        <Button onClick={() => setLocation('/flights/new')} data-testid="button-new-flight">
          <Plus className="h-4 w-4 mr-2" />
          New Flight
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full sm:w-auto">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="scheduled" data-testid="tab-scheduled">
              Scheduled ({statusCounts.scheduled})
            </TabsTrigger>
            <TabsTrigger value="boarding" data-testid="tab-boarding">
              Boarding ({statusCounts.boarding})
            </TabsTrigger>
            <TabsTrigger value="departed" data-testid="tab-departed">
              Departed ({statusCounts.departed})
            </TabsTrigger>
            <TabsTrigger value="arrived" data-testid="tab-arrived">
              Arrived ({statusCounts.arrived})
            </TabsTrigger>
            <TabsTrigger value="delayed" data-testid="tab-delayed">
              Delayed ({statusCounts.delayed})
            </TabsTrigger>
            <TabsTrigger value="cancelled" data-testid="tab-cancelled">
              Cancelled ({statusCounts.cancelled})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-flights"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={10} />
      ) : filteredFlights.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No flights found"
          description={
            searchQuery
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by scheduling your first flight'
          }
          action={
            !searchQuery
              ? {
                  label: 'Schedule Flight',
                  onClick: () => setLocation('/flights/new'),
                }
              : undefined
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
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Flight #</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Route</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Aircraft</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Captain</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Departure</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Arrival</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Gate</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Passengers</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-right py-4 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((flight, index) => (
                  <motion.tr
                    key={flight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                    data-testid={`row-flight-${flight.id}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">{flight.flight_number}</span>
                        {flight.delay_minutes > 0 && (
                          <span className="text-xs text-orange-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            +{flight.delay_minutes}m
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {flight.routes
                        ? `${flight.routes.origin_code} → ${flight.routes.destination_code}`
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground font-mono">
                      {flight.aircraft?.registration || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {flight.captain?.full_name || 'Unassigned'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {flight.departure_time ? format(new Date(flight.departure_time), 'MMM d, HH:mm') : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {flight.arrival_time ? format(new Date(flight.arrival_time), 'MMM d, HH:mm') : 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">
                      {flight.gate ? `${flight.gate} / ${flight.terminal || 'N/A'}` : 'TBA'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{flight.passenger_count || 0}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={flight.status} type="flight" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          data-testid={`button-edit-${flight.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(flight.id)}
                          data-testid={`button-delete-${flight.id}`}
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
        title="Delete Flight"
        description="Are you sure you want to delete this flight? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
