const STORAGE_KEY = 'skyair-dept-notifications';

type DeptNotification = {
  id: string;
  department_id: string | null;
  title: string;
  message: string;
  data?: any;
  is_read?: boolean;
  created_at: string;
};

function readStorage(): DeptNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeptNotification[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: DeptNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function notifyDepartment(departmentId: string | null, title: string, message: string, data?: any) {
  const item: DeptNotification = {
    id: `dept-notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    department_id: departmentId ?? null,
    title,
    message,
    data: data ?? null,
    is_read: false,
    created_at: new Date().toISOString(),
  };
  const all = readStorage();
  all.unshift(item);
  writeStorage(all);
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('skyair-department-notification', { detail: { departmentId } }));
    } catch {
      // ignore
    }
  }
}

export function getDepartmentNotifications(departmentId: string | null) {
  const all = readStorage();
  return all.filter((n) => n.department_id === departmentId);
}

export function markDepartmentNotificationsRead(departmentId: string | null) {
  const all = readStorage();
  const next = all.map((n) => (n.department_id === departmentId ? { ...n, is_read: true } : n));
  writeStorage(next);
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('skyair-department-notification-read', { detail: { departmentId } }));
    } catch {
      // ignore
    }
  }
}

export default {} as const;
