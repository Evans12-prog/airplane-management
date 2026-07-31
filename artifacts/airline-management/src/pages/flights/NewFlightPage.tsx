import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlights } from '@/hooks/useFlights';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { toast } from 'sonner';

type Aircraft = Database['public']['Tables']['aircraft']['Row'];
type Route = Database['public']['Tables']['routes']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'];

const flightSchema = z.object({
  flight_number: z.string().min(3, 'Flight number is required').max(10),
  aircraft_id: z.string().min(1, 'Aircraft is required'),
  route_id: z.string().min(1, 'Route is required'),
  captain_id: z.string().optional(),
  departure_time: z.string().min(1, 'Departure time is required'),
  arrival_time: z.string().min(1, 'Arrival time is required'),
  gate: z.string().optional(),
  terminal: z.string().optional(),
  passenger_count: z.coerce.number().min(0).default(0),
  status: z.enum(['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled', 'diverted']).default('scheduled'),
  notes: z.string().optional(),
});

export default function NewFlightPage() {
  const [, setLocation] = useLocation();
  const { createFlight } = useFlights();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [captains, setCaptains] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof flightSchema>>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flight_number: '',
      aircraft_id: '',
      route_id: '',
      captain_id: '',
      departure_time: '',
      arrival_time: '',
      gate: '',
      terminal: '',
      passenger_count: 0,
      status: 'scheduled',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const [aircraftRes, routesRes, captainsRes] = await Promise.all([
        supabase.from('aircraft').select('*').eq('status', 'active'),
        supabase.from('routes').select('*').eq('is_active', true),
        supabase
          .from('employees')
          .select('*')
          .or('job_title.ilike.%Captain%,job_title.ilike.%Pilot%')
          .eq('status', 'active'),
      ]);

      setAircraft(aircraftRes.data || []);
      setRoutes(routesRes.data || []);
      setCaptains(captainsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof flightSchema>) => {
    setIsSubmitting(true);
    try {
      await createFlight({
        flight_number: values.flight_number,
        aircraft_id: values.aircraft_id,
        route_id: values.route_id,
        captain_id: values.captain_id || null,
        departure_time: values.departure_time,
        arrival_time: values.arrival_time,
        gate: values.gate || null,
        terminal: values.terminal || null,
        passenger_count: values.passenger_count,
        status: values.status,
        notes: values.notes || null,
        delay_minutes: 0,
        actual_departure: null,
        actual_arrival: null,
        delay_reason: null,
        cancellation_reason: null,
        fuel_used_liters: null,
        available_seats: null,
      });
      toast.success('Flight created successfully');
      setLocation('/flights');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create flight');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => setLocation('/flights')} className="mb-6" data-testid="button-back">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Flights
      </Button>

      <div className="bg-card border border-card-border rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Schedule New Flight</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="flight_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Number</FormLabel>
                    <FormControl>
                      <Input placeholder="SA123" {...field} data-testid="input-flight-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="boarding">Boarding</SelectItem>
                        <SelectItem value="departed">Departed</SelectItem>
                        <SelectItem value="arrived">Arrived</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aircraft</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-aircraft">
                          <SelectValue placeholder="Select aircraft" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aircraft.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.registration} - {a.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-route">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {routes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.origin_code} → {r.destination_code} ({r.origin_city} to {r.destination_city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="captain_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Captain (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-captain">
                          <SelectValue placeholder="Select captain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {captains.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name} - {c.job_title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passenger_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passenger Count</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} data-testid="input-passenger-count" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departure_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} data-testid="input-departure-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arrival_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} data-testid="input-arrival-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gate (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="A12" {...field} data-testid="input-gate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terminal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terminal (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="International" {...field} data-testid="input-terminal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional flight information..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1" data-testid="button-submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Flight'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/flights')}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
