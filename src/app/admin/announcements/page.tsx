"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { FaSpinner, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { getAllUsers, UserProfile } from "@/lib/apis/users";

// Add this mapping at the top, after imports
const TARGETS = [
  { label: "Everyone", value: "everyone" },
  { label: "Batch", value: "batch" },
  { label: "Student", value: "student" },
];

function getTypeLabel(type: string) {
  return TARGETS.find(t => t.value === type)?.label || type;
}

export default function AdminAnnouncementsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState<string | null>(null);
  const [users, setUsers] = useState<Map<string, UserProfile>>(new Map());

  // Fetch posts
  useEffect(() => {
    setPostsLoading(true);
    setPostsError(null);
    const unsub = onSnapshot(collection(db, "posts"), (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPostsLoading(false);
    }, (err) => {
      setPostsError("Failed to load posts.");
      setPostsLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch users for mapping UID to displayName
  useEffect(() => {
    getAllUsers().then((response) => {
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        console.error("Error fetching users:", response.error);
      }
    });
  }, []);

  // Start editing
  const startEdit = (post: any) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  // Save edit
  const saveEdit = async (post: any) => {
    setEditSubmitting(true);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        title: editTitle,
        body: editBody,
      });
      setEditingId(null);
      setEditTitle("");
      setEditBody("");
    } catch (err) {
      alert("Failed to update post.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete post
  const deletePost = async (post: any) => {
    if (!confirm("Are you sure you want to discard this post?")) return;
    setDeleteSubmitting(post.id);
    try {
      await deleteDoc(doc(db, "posts", post.id));
    } catch (err) {
      alert("Failed to delete post.");
    } finally {
      setDeleteSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl flex justify-end mb-6">
        <Link href="/admin/announcements/create">
          <button className="bg-tathir-dark-green text-tathir-beige px-4 py-2 rounded-lg font-semibold hover:bg-green-800 transition shadow-md">Create Announcement</button>
        </Link>
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-tathir-dark-green">All Announcements & Notices</h2>
        {postsLoading ? (
          <div className="flex items-center gap-2 text-gray-500"><FaSpinner className="animate-spin" /> Loading posts...</div>
        ) : postsError ? (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded px-3 py-2 text-sm font-medium animate-shake">{postsError}</div>
        ) : posts.length === 0 ? (
          <div className="text-gray-500">No posts found.</div>
        ) : (
          <div className="space-y-5">
            {posts.map(post => (
              <div key={post.id} className="bg-white/90 border border-tathir-dark-green/10 rounded-xl shadow p-5 flex flex-col gap-2">
                {editingId === post.id ? (
                  <>
                    <input
                      className="border rounded px-2 py-1 mb-2"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      disabled={editSubmitting}
                    />
                    <textarea
                      className="border rounded px-2 py-1 mb-2"
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      disabled={editSubmitting}
                    />
                    <div className="flex gap-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1" onClick={() => saveEdit(post)} disabled={editSubmitting}><FaSave /> Save</button>
                      <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded flex items-center gap-1" onClick={cancelEdit} disabled={editSubmitting}><FaTimes /> Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-tathir-dark-green text-lg">{post.title}</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold border border-green-200">
                        {getTypeLabel(post.type) === 'Student' ? users.get(post.value)?.displayName : getTypeLabel(post.type)}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">{post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString() : ""}</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-line">{post.body}</div>
                    <div className="flex gap-2 mt-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1" onClick={() => startEdit(post)}><FaEdit /> Edit</button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1" onClick={() => deletePost(post)} disabled={deleteSubmitting === post.id}>
                        {deleteSubmitting === post.id ? <FaSpinner className="animate-spin" /> : <FaTrash />} Discard
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
