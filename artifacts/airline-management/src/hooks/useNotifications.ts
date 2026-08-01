import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Notification = Database['public']['Tables']['notifications']['Row'];

export function useNotifications(userId: string | null | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let channel: any;

    const loadNotifications = async () => {
      if (!isSupabaseConfigured) {
        const fallbackNotifications: Notification[] = [
          {
            id: 'local-notification-1',
            user_id: userId,
            type: 'system',
            title: 'Welcome to SkyAir',
            message: 'Your administrator workspace is ready.',
            data: {},
            is_read: false,
            created_at: new Date().toISOString(),
          } as Notification,
        ];
        setNotifications(fallbackNotifications);
        setUnreadCount(1);
        setLoading(false);
        return;
      }

      const notificationsClient = (supabase as any).from('notifications');
      const { data, error } = await notificationsClient
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data as Notification[]);
        setUnreadCount((data as Notification[]).filter((notification) => !notification.is_read).length);
      }
      setLoading(false);

      const rawChannel = supabase.channel(`notifications-${userId}`) as any;
      channel = rawChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload: { new: Notification }) => {
          setNotifications((prev) => {
            const next = [payload.new, ...prev.filter((item) => item.id !== payload.new.id)];
            setUnreadCount(next.filter((item) => !item.is_read).length);
            return next;
          });
        })
        .subscribe();
    };

    void loadNotifications();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (!userId || !isSupabaseConfigured) return;
    const notificationsClient = (supabase as any).from('notifications');
    await notificationsClient.update({ is_read: true }).eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    setUnreadCount(0);

    if (!userId || !isSupabaseConfigured) return;
    const notificationsClient = (supabase as any).from('notifications');
    await notificationsClient.update({ is_read: true }).eq('user_id', userId);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
