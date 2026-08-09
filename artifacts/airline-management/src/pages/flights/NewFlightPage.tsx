import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
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
  aircraft_id: z.string().optional(),
  route_id: z.string().optional(),
  captain_id: z.string().optional(),
  aircraft_name: z.string().optional(),
  route_name: z.string().optional(),
  captain_name: z.string().optional(),
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
  const [match, params] = useRoute('/flights/edit/:id');
  const flightId = params?.id;
  const isEditing = Boolean(match && flightId);
  const { createFlight, updateFlight } = useFlights();
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
      aircraft_name: '',
      route_name: '',
      captain_name: '',
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
      try {
        const [aircraftRes, routesRes, captainsRes] = await Promise.all([
          (supabase.from('aircraft') as any).select('*').eq('status', 'active'),
          (supabase.from('routes') as any).select('*').eq('is_active', true),
          (supabase.from('employees') as any)
            .select('*')
            .or('job_title.ilike.%Captain%,job_title.ilike.%Pilot%')
            .eq('status', 'active'),
        ]);

        setAircraft((aircraftRes.data || []) as Aircraft[]);
        setRoutes((routesRes.data || []) as Route[]);
        setCaptains((captainsRes.data || []) as Employee[]);

        if (isEditing && flightId) {
          const { data: existingFlight, error: flightError } = await (supabase.from('flights') as any)
            .select('*')
            .eq('id', flightId)
            .single();

          if (flightError) {
            throw flightError;
          }

          if (existingFlight) {
            form.reset({
              flight_number: existingFlight.flight_number,
              aircraft_id: existingFlight.aircraft_id || '',
              route_id: existingFlight.route_id || '',
              captain_id: existingFlight.captain_id || undefined,
              departure_time: existingFlight.departure_time?.slice(0, 16) || '',
              arrival_time: existingFlight.arrival_time?.slice(0, 16) || '',
              gate: existingFlight.gate || '',
              terminal: existingFlight.terminal || '',
              passenger_count: existingFlight.passenger_count ?? 0,
              status: existingFlight.status,
              notes: existingFlight.notes || '',
            });
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load flight form data');
        setAircraft([]);
        setRoutes([]);
        setCaptains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [flightId, isEditing, form]);

  const createOrGetAircraft = async (name?: string) => {
    if (!name?.trim()) return null;
    const registration = name.trim();
    const { data, error } = await (supabase.from('aircraft') as any)
      .insert({
        registration,
        model: registration,
        manufacturer: 'Custom',
        capacity: 0,
        fuel_capacity_liters: 0,
        status: 'active',
        total_flight_hours: 0,
        year_manufactured: new Date().getFullYear(),
      })
      .select('id')
      .single();
    if (error) throw error;
    return data?.id ?? null;
  };

  const createOrGetRoute = async (name?: string) => {
    if (!name?.trim()) return null;
    const routeLabel = name.trim();
    const [originCode, destinationCode] = routeLabel.split(/\s*→\s*|\s*-\s*|\s*to\s*/i);
    const origin = originCode?.trim() || routeLabel;
    const destination = destinationCode?.trim() || routeLabel;
    const { data, error } = await (supabase.from('routes') as any)
      .insert({
        origin_code: origin,
        origin_city: origin,
        destination_code: destination,
        destination_city: destination,
        distance_km: 0,
        estimated_duration_minutes: 0,
        is_active: true,
      })
      .select('id')
      .single();
    if (error) throw error;
    return data?.id ?? null;
  };

  const createOrGetCaptain = async (name?: string) => {
    if (!name?.trim()) return null;
    const fullName = name.trim();
    const employeeNumber = `EMP-${Date.now().toString().slice(-6)}`;
    const email = `${fullName.replace(/\s+/g, '.').toLowerCase()}@skyair.local`;
    const { data, error } = await (supabase.from('employees') as any)
      .insert({
        employee_number: employeeNumber,
        full_name: fullName,
        email,
        phone: null,
        department_id: null,
        role_id: null,
        job_title: 'Captain',
        employment_type: 'full_time',
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0],
        certifications: [],
      })
      .select('id')
      .single();
    if (error) throw error;
    return data?.id ?? null;
  };

  const onSubmit = async (values: z.infer<typeof flightSchema>) => {
    setIsSubmitting(true);
    try {
      let aircraftId = values.aircraft_id || null;
      let routeId = values.route_id || null;
      let captainId = values.captain_id || null;

      if (!aircraftId && values.aircraft_name) {
        aircraftId = await createOrGetAircraft(values.aircraft_name);
      }
      if (!routeId && values.route_name) {
        routeId = await createOrGetRoute(values.route_name);
      }
      if (!captainId && values.captain_name) {
        captainId = await createOrGetCaptain(values.captain_name);
      }

      if (!aircraftId) {
        throw new Error('Aircraft is required');
      }
      if (!routeId) {
        throw new Error('Route is required');
      }

      const payload = {
        flight_number: values.flight_number,
        aircraft_id: aircraftId,
        route_id: routeId,
        captain_id: captainId,
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
      } as Database['public']['Tables']['flights']['Insert'];

      if (isEditing && flightId) {
        await updateFlight(flightId, payload);
        toast.success('Flight updated successfully');
      } else {
        await createFlight(payload);
        toast.success('Flight created successfully');
      }

      setLocation('/flights');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save flight');
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
                    <Select onValueChange={field.onChange} value={field.value || 'scheduled'}>
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
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('aircraft_name', '');
                      }}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-aircraft">
                          <SelectValue placeholder="Select aircraft" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {aircraft.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.registration} - {a.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <div className="mt-2">
                      <Input
                        placeholder="Or enter aircraft registration"
                        value={form.watch('aircraft_name')}
                        onChange={(event) => {
                          form.setValue('aircraft_name', event.target.value);
                          field.onChange('');
                        }}
                        data-testid="input-aircraft-name"
                      />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('route_name', '');
                      }}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-route">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {routes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.origin_code} → {r.destination_code} ({r.origin_city} to {r.destination_city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <div className="mt-2">
                      <Input
                        placeholder="Or enter route (e.g. JHB → CPT)"
                        value={form.watch('route_name')}
                        onChange={(event) => {
                          form.setValue('route_name', event.target.value);
                          field.onChange('');
                        }}
                        data-testid="input-route-name"
                      />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="captain_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Captain (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('captain_name', '');
                      }}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-captain">
                          <SelectValue placeholder="Select captain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {captains.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name} - {c.job_title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <div className="mt-2">
                      <Input
                        placeholder="Or enter captain name"
                        value={form.watch('captain_name')}
                        onChange={(event) => {
                          form.setValue('captain_name', event.target.value);
                          field.onChange('');
                        }}
                        data-testid="input-captain-name"
                      />
                    </div>
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
