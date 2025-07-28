"use client";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";
import { db } from "@/lib/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  collection as firestoreCollection,
} from "firebase/firestore";
import { FaSpinner } from "react-icons/fa";
import Select from "react-select";
import Link from "next/link";
import { getBatches, SimpleBatch } from "@/lib/apis/batches";
import { useAllUsers } from "@/hooks/useAllUsers";

const TARGETS = [
  { label: "Everyone", value: "everyone" },
  { label: "Batch", value: "batch" },
  { label: "Student", value: "student" },
];

function getInitials(nameOrEmail: string) {
  if (!nameOrEmail) return "?";
  const parts = nameOrEmail.split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function CreateAnnouncementPage() {
  const { user } = useContext(AuthContext)!;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState("everyone");
  const [targetValue, setTargetValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [batches, setBatches] = useState<SimpleBatch[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<SimpleBatch | null>(null);

  // Use the new hook for users
  const { users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useAllUsers();

  useEffect(() => {
    if (targetType === "batch") {
      setBatchLoading(true);
      getBatches()
        .then((response) => {
          if (response.success && response.data) {
            setBatches(response.data);
          } else {
            console.error("Error fetching batches:", response.error);
          }
        })
        .finally(() => setBatchLoading(false));
    }
    // No need to fetch users here, handled by hook
    // eslint-disable-next-line
  }, [targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!title.trim() || !body.trim()) {
      setError("Title and message are required.");
      return;
    }
    if (targetType === "batch" && !selectedBatch) {
      setError("Please select a batch.");
      return;
    }
    if (targetType === "student" && !targetValue.trim()) {
      setError("Please specify a student.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        title,
        body,
        createdAt: new Date(),
        type: targetType,
        value:
          targetType === "everyone"
            ? null
            : targetType === "batch"
            ? selectedBatch?.id
            : targetValue.trim(),
      });
      setTitle("");
      setBody("");
      setTargetType("everyone");
      setTargetValue("");
      setSelectedBatch(null);
      setSuccess(true);
    } catch (err) {
      setError("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-xl flex justify-start mb-6">
        <Link href="/admin/announcements">
          <button className="bg-tathir-dark-green text-tathir-beige px-4 py-2 rounded-lg font-semibold hover:bg-green-800 transition shadow-md">
            Back to Announcements
          </button>
        </Link>
        {targetType === "student" && (
          <button
            type="button"
            onClick={refreshUsers}
            className="ml-4 bg-tathir-dark-green text-tathir-beige px-4 py-2 rounded-lg font-semibold hover:bg-green-800 transition shadow-md flex items-center gap-2"
            disabled={usersLoading}
            title="Refresh user list"
          >
            {usersLoading && <FaSpinner className="animate-spin" />} Refresh Students
          </button>
        )}
      </div>
      <div className="w-full max-w-xl bg-white/90 p-8 rounded-2xl shadow-xl border border-tathir-dark-green/10">
        <h1 className="text-2xl font-bold mb-6 text-center text-tathir-dark-green">
          Create Announcement/Notice
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1 text-tathir-dark-green">
              Title
            </label>
            <input
              type="text"
              className="w-full border border-tathir-dark-green/30 rounded-lg px-3 py-2 bg-tathir-beige/40 focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/40 focus:border-tathir-dark-green transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter post title"
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-tathir-dark-green">
              Message
            </label>
            <textarea
              className="w-full border border-tathir-dark-green/30 rounded-lg px-3 py-2 bg-tathir-beige/40 focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/40 focus:border-tathir-dark-green transition min-h-[100px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Write your announcement or notice here..."
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-tathir-dark-green">
              Target Audience
            </label>
            <select
              className="w-full border border-tathir-dark-green/30 rounded-lg px-3 py-2 bg-tathir-beige/40 focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/40 focus:border-tathir-dark-green transition"
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setTargetValue("");
              }}
            >
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {targetType === "batch" && (
            <div>
              <label className="block font-medium mb-1 text-tathir-dark-green">
                Select Batch
              </label>
              <Select
                isClearable
                isLoading={batchLoading}
                options={batches.map((b) => ({ value: b.id, label: b.name }))}
                value={
                  selectedBatch
                    ? { value: selectedBatch.id, label: selectedBatch.name }
                    : null
                }
                onChange={(option) => {
                  const batch =
                    batches.find((b) => b.id === option?.value) || null;
                  setSelectedBatch(batch);
                  setTargetValue(option ? option.value : "");
                }}
                placeholder="Select a batch..."
                classNamePrefix="tathir-select"
              />
            </div>
          )}
          {targetType === "student" && (
            <div>
              <label className="block font-medium mb-1 text-tathir-dark-green">
                Select Student
              </label>
              {usersLoading ? (
                <div className="text-gray-500 text-sm">Loading students...</div>
              ) : usersError ? (
                <div className="text-red-500 text-sm">{usersError}</div>
              ) : (
                <Select
                  classNamePrefix="tathir-select"
                  options={users.map((user) => ({
                    value: user.uid,
                    label: user.displayName
                      ? `${user.displayName} (${user.email})`
                      : user.email,
                    data: user,
                  }))}
                  value={
                    users
                      .map((user) => ({
                        value: user.uid,
                        label: user.displayName
                          ? `${user.displayName} (${user.email})`
                          : user.email,
                        data: user,
                      }))
                      .find((option) => option.value === targetValue) || null
                  }
                  onChange={(option) =>
                    setTargetValue(option ? option.value : "")
                  }
                  placeholder="Select a student..."
                  isClearable
                  required
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "#f9f7f3",
                      borderColor: state.isFocused ? "#14532d" : "#14532d4d",
                      boxShadow: state.isFocused
                        ? "0 0 0 2px #14532d66"
                        : undefined,
                      borderRadius: 8,
                      minHeight: 44,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#14532d22"
                        : state.isFocused
                        ? "#e6f4ea"
                        : undefined,
                      color: "#14532d",
                      padding: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }),
                  }}
                  formatOptionLabel={(option) => (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                        {getInitials(
                          option.data.displayName || option.data.email
                        )}
                      </span>
                      <span>
                        <span className="font-medium">
                          {option.data.displayName || option.data.email}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {option.data.email}
                        </span>
                      </span>
                    </div>
                  )}
                />
              )}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded px-3 py-2 text-sm font-medium animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 rounded px-3 py-2 text-sm font-medium">
              Announcement created!
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-tathir-dark-green text-tathir-beige py-2.5 rounded-lg font-semibold hover:bg-green-800 focus:bg-green-900 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting && <FaSpinner className="animate-spin" />} Create Post
          </button>
        </form>
      </div>
    </div>
  );
}
