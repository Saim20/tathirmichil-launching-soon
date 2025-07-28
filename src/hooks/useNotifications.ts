import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: string;
  challengeId: string;
  from: string;
  fromName: string;
  createdAt: any;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let unsub = () => {};
    let active = true;
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(
          collection(db, "users", user.uid, "notifications"),
          where("read", "==", false)
        );
        unsub = onSnapshot(q, (snap) => {
          if (!active) return;
          setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
          if (snap.docs.length > 0) {
            toast.success(`You have ${snap.docs.length} new notifications`);
          }
        });
      } else {
        setNotifications([]);
      }
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);
  return notifications;
} 