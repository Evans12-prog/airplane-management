import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plane, Wrench, Users, CheckCheck, Filter } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const iconMap = {
  flight_delay: Plane,
  maintenance_due: Wrench,
  crew_assignment: Users,
  employee_registered: Users,
  password_changed: Users,
  flight_cancelled: Plane,
  system: Bell,
};

export default function NotificationsPage() {
  const { user } = useAuthContext();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications(user?.id);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    let result = notifications;
    if (filter === 'unread') {
      result = result.filter((n) => !n.is_read);
    }
    if (typeFilter !== 'all') {
      result = result.filter((n) => n.type === typeFilter);
    }
    return result;
  }, [notifications, filter, typeFilter]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" data-testid="button-mark-all-read">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" data-testid="tab-unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="all" data-testid="filter-all">
              <Filter className="h-3 w-3 mr-1" />
              All
            </TabsTrigger>
            <TabsTrigger value="flight_delay" data-testid="filter-flight">
              Flights
            </TabsTrigger>
            <TabsTrigger value="maintenance_due" data-testid="filter-maintenance">
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="crew_assignment" data-testid="filter-crew">
              Crew
            </TabsTrigger>
            <TabsTrigger value="employee_registered" data-testid="filter-hr">
              HR
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={filter === 'unread' ? 'All notifications have been read' : 'You have no notifications yet'}
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification, index) => {
            const Icon = iconMap[notification.type as keyof typeof iconMap] || Bell;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                className={cn(
                  'bg-card border border-card-border rounded-xl p-5 transition-all cursor-pointer hover:shadow-md',
                  !notification.is_read && 'border-primary/50 bg-primary/5'
                )}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      notification.is_read
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn('font-semibold', notification.is_read ? 'text-foreground' : 'text-foreground')}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="flex-shrink-0 h-2 w-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{format(new Date(notification.created_at), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
