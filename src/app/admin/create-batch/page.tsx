"use client";
import { db } from '@/lib/firebase/firebase';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';

const Page = () => {
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddBatch = async () => {
    if (!batchName.trim()) {
      alert('Please enter a valid batch name');
      return;
    }

    setLoading(true);
    try {
      const batchesCollection = collection(db, 'batches');
      await addDoc(batchesCollection, {
        name: batchName,
        createdAt: new Date(),
      });
      setBatchName('');
      alert('Batch added successfully');
    } catch (error) {
      console.error('Error adding batch: ', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="bg-tathir-maroon shadow-2xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-tathir-beige uppercase mb-6 text-center">Create a New Batch</h2>

        <input
          type="text"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="Batch name"
          className="w-full px-4 py-2 bg-tathir-beige rounded-xl mb-4 focus:outline-none focus:ring-0 text-tathir-maroon font-mono"
        />

        <button
          onClick={handleAddBatch}
          disabled={loading}
          className="w-full py-2 rounded-xl font-semibold text-tathir-beige bg-tathir-dark-green uppercase cursor-pointer transition duration-200"
        >
          {loading ? 'Adding...' : 'Add Batch'}
        </button>
      </div>
    </div>
  );
};

export default Page;
