"use client";

import { useEffect, useState, useCallback } from "react";
import { auth, db } from "@/lib/firebase/firebase";
import Link from "next/link";
import { doc, updateDoc, getFirestore, Timestamp } from "firebase/firestore";
import {
  FaPlay,
  FaCheckCircle,
  FaSpinner,
  FaUserFriends,
  FaPlus
} from "react-icons/fa";
import { ChallengeTest } from "@/lib/apis/tests";
import { ChallengeCard } from "./ChallengeCard";
import { bloxat } from "@/components/fonts";
import { Button } from "@/components/shared/ui/Button";

export default function ChallengeDashboard() {
  const [challenges, setChallenges] = useState<ChallengeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const { getFirestore, collection, query, where, onSnapshot } =
          await import("firebase/firestore");
        const db = getFirestore();
        const q1 = query(
          collection(db, "challenge-tests"),
          where("createdBy", "==", user.uid)
        );
        const q2 = query(
          collection(db, "challenge-tests"),
          where("invitedUser", "==", user.uid)
        );
        const unsub1 = onSnapshot(q1, (snap1) => {
          const data1 = snap1.docs.map(
            (doc) =>
              {
                const startTime = (doc.data().startTime as Timestamp).toDate(); 
                const createdAt = (doc.data().createdAt as Timestamp).toDate();
                return ({
                  id: doc.id,
                  ...doc.data(),
                  startTime: startTime,
                  createdAt: createdAt,
                } as ChallengeTest)}
          );
          setChallenges((prev) => {
            const filtered = prev.filter((c) => c.createdBy !== user.uid);
            return [...filtered, ...data1];
          });
        });
        const unsub2 = onSnapshot(q2, (snap2) => {
          const data2 = snap2.docs.map(
            (doc) =>
              {
                const startTime = (doc.data().startTime as Timestamp).toDate(); 
                const createdAt = (doc.data().createdAt as Timestamp).toDate();
                return ({
                  id: doc.id,
                  ...doc.data(),
                  startTime: startTime,
                  createdAt: createdAt,
                } as ChallengeTest)}
          );
          setChallenges((prev) => {
            const filtered = prev.filter((c) => c.invitedUser !== user.uid);
            return [...filtered, ...data2];
          });
        });
        setLoading(false);
        return () => {
          unsub1();
          unsub2();
        };
      } else {
        setUserId(null);
        setChallenges([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAccept = useCallback(async (id: string) => {
    setAccepting((prev) => ({ ...prev, [id]: true }));
    await updateDoc(doc(db, "challenge-tests", id), { status: "accepted" });
    setAccepting((prev) => ({ ...prev, [id]: false }));
  }, []);

  const content = loading ? (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[200px] text-tathir-brown">
      <FaSpinner className="animate-spin text-4xl mb-3" />
      <span className={`text-xl ${bloxat.className}`}>Loading challenges...</span>
    </div>
  ) : challenges.length === 0 ? (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[300px] text-tathir-brown">
      <FaUserFriends className="text-6xl mb-4" />
      <span className={`text-xl text-center ${bloxat.className}`}>No challenges found.</span>
      <Button
        variant="primary"
        icon={<FaPlus />}
        onClick={() => window.location.href = '/test/challenge/new'}
        className="mt-6"
      >
        Create Your First Challenge
      </Button>
    </div>
  ) : (
    <>
      <div className="flex justify-end mb-6">
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={() => window.location.href = '/test/challenge/new'}
        >
          New Challenge
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            userId={userId}
            accepting={!!accepting[challenge.id]}
            onAccept={handleAccept}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-2xl md:text-3xl font-bold text-tathir-dark-green ${bloxat.className}`}>
          Challenge Tests
        </h1>
        <p className="mt-2 text-sm md:text-base text-tathir-brown">
          Compete with other students in real-time and test your knowledge against your peers.
        </p>
      </div>

      {/* Content */}
      {content}
    </div>
  );
}
