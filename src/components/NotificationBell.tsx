import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ... (resto del código sin cambios)
}