'use client'

import { useNotifications, Notification } from "@/hooks/useNotifications";
import { getDefaultUser } from "@/lib/apis/users";
import { db } from "@/lib/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationBell() {
  const notifications = useNotifications();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Mark notification as read
  async function markAsRead(notification: Notification) {
    const userResponse = await getDefaultUser();
    if (!userResponse.success || !userResponse.data) return;
    await updateDoc(
      doc(db, `users/${userResponse.data.uid}/notifications`, notification.id),
      {
        read: true,
      }
    );
  }

  return (
    <div className="relative inline-block">
      <button
        className="relative focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <span role="img" aria-label="bell" className="text-2xl">
          🔔
        </span>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-2 text-xs">
            {notifications.length}
          </span>
        )}
      </button>
      {open && notifications.length > 0 && (
        <div className="absolute right-0 pl-4 p-2 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <ul>
            {notifications.map( (n) => {
              return (
                <li
                  key={n.id}
                  className="border-b last:border-0 p-3 hover:bg-gray-100"
                >
                  <button
                    onClick={async () => {
                      await markAsRead(n);
                      router.push(`/challenge`);
                      setOpen(false);
                    }}
                    className="block"
                  >
                    <div className="font-semibold">New Challenge!</div>
                    <div className="text-sm text-gray-600">
                      You were challenged by {n.fromName}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(
                        n.createdAt.seconds
                          ? n.createdAt.seconds * 1000
                          : n.createdAt
                      ).toLocaleString()}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {open && notifications.length === 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 p-4 text-center text-gray-500">
          No new notifications
        </div>
      )}
    </div>
  );
}
