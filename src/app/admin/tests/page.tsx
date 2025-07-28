"use client";

import { useEffect, useState } from "react";
import { LiveTest, AssessmentTest, subscribeToLiveTests, subscribeToAssessmentTests } from "@/lib/apis/tests";
import { auth, db } from "@/lib/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import AdminTestCard from "@/components/AdminTestCard";
import Link from "next/link";

export default function AdminManageTestsPage() {
  const [liveTests, setLiveTests] = useState<LiveTest[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [evaluatingLive, setEvaluatingLive] = useState(false);

  const evaluateLiveTest = async (testId: string) => {
    setEvaluatingLive(true);
    try {
      const response = await fetch(`/admin/api/evaluate-live-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({ testId }),
      });

      if (response.ok) {
        alert(`Live Test ${testId} evaluated successfully.`);
      } else {
        const errorData = await response.json();
        alert(`Failed to evaluate live test: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error evaluating live test:", error);
      alert("An error occurred while evaluating the live test.");
    } finally {
      setEvaluatingLive(false);
    }
  };

  useEffect(() => {
    const unsubscribeLive = subscribeToLiveTests((newTests) => {
      setLiveTests(newTests);
      setLoadingLive(false);
    });
    return () => {
      unsubscribeLive();
    };
  }, []);

  return (
    <div className="admin-manage-tests-page">
      <h1 className="text-2xl font-bold m-6">Manage Tests</h1>
      <section className="m-6">
        <h2 className="text-xl font-semibold mb-4">Live Tests</h2>
        {loadingLive ? (
          <p className="text-center">Loading live tests...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTests.map((test) => (
              <AdminTestCard<LiveTest>
                key={test.id}
                test={test}
                onEvaluate={evaluateLiveTest}
                evaluating={evaluatingLive}
                type={"live"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
