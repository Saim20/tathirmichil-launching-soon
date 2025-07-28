"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

export default function NewChallengePage() {
  const [friend, setFriend] = useState("");
  const [time, setTime] = useState(10); // in minutes
  const [startTime, setStartTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [categories, setCategories] = useState([
    { category: '', numQuestions: 3, numComprehensive: 1 }
  ]);

  const allCategories = ["Math", "English", "Analytical"];

  async function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to create a challenge.");
        setLoading(false);
        return;
      }

      // Call your backend or Firestore directly to create the challenge test
      const idToken = await user.getIdToken();

      const totalQuestions = categories.reduce((sum, c) => sum + c.numQuestions + c.numComprehensive, 0);

      // Validate that at least one question is selected
      if (totalQuestions === 0) {
        setError("Please select at least one question (normal or comprehensive).");
        setLoading(false);
        return;
      }

      // Validate each category has questions if selected
      for (const cat of categories) {
        if (cat.category && (cat.numQuestions + cat.numComprehensive) === 0) {
          setError(`Category "${cat.category}" must have at least one question.`);
          setLoading(false);
          return;
        }
      }

      // Convert startTime (local) to ISO string and append +06:00
      let startTimeWithOffset = startTime;
      if (startTime) {
        // startTime is in 'YYYY-MM-DDTHH:mm' (local time)
        startTimeWithOffset = startTime + ':00+06:00';
      }

      const response = await fetch("/student/api/create-challenge-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          invitedUser: friend.trim().toLowerCase(),
          categories, // array of {category, numQuestions}
          numQuestions: totalQuestions,
          time: time * 60, // Pass the time value
          startTime: startTimeWithOffset, // Pass the start time value with UTC+6 signature
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.challengeTestId) {
        // Redirect to the challenge test page
        router.push(`/test/challenge`);
      } else {
        setError(data.message || "Failed to create challenge.");
      }
    } catch (err) {
      setError("An error occurred while creating the challenge.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-tathir-cream py-8 px-4">
      <div className="mx-auto">
        <div className="bg-tathir-beige rounded-lg shadow-lg border border-tathir-brown/20 overflow-hidden">
          {/* Header */}
          <div className="bg-tathir-dark-green px-6 py-4">
            <h1 className="text-2xl font-bold text-tathir-beige">Challenge a Friend</h1>
            <p className="text-tathir-cream/80 text-sm mt-1">Create a personalized test challenge for your friend</p>
          </div>
          
          <form onSubmit={handleCreateChallenge} className="p-6 space-y-6">
            <div>
              <label className="block text-tathir-brown font-medium mb-2">Friend's Email</label>
              <input
                type="text"
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
                className="w-full border-2 border-tathir-brown/20 px-4 py-3 rounded-lg focus:border-tathir-dark-green focus:outline-none transition-colors bg-white"
                required
                placeholder="Enter friend's email"
              />
            </div>
            
            <div>
              <label className="block text-tathir-brown font-medium mb-3">Categories & Number of Questions</label>
              {categories.map((catObj, idx) => (
                <div key={idx} className="mb-4 p-4 border-2 border-tathir-brown/20 rounded-lg bg-tathir-cream/50">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    <select
                      value={catObj.category}
                      onChange={e => {
                        const newCats = [...categories];
                        newCats[idx].category = e.target.value;
                        setCategories(newCats);
                      }}
                      className="border-2 border-tathir-brown/20 px-3 py-2 rounded-lg focus:border-tathir-dark-green focus:outline-none min-w-[140px] bg-white"
                      required
                    >
                      <option value="">Select category</option>
                      {allCategories.filter(cat => !categories.some((c, i) => c.category === cat && i !== idx)).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    
                    <div className="flex gap-4 items-center flex-wrap">
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-tathir-brown/70 mb-1 font-medium">Normal Questions</label>
                        <input
                          type="number"
                          min={0}
                          max={15}
                          value={catObj.numQuestions}
                          onChange={e => {
                            const newCats = [...categories];
                            newCats[idx].numQuestions = Number(e.target.value);
                            setCategories(newCats);
                          }}
                          className="border-2 border-tathir-brown/20 px-3 py-2 rounded-lg w-20 text-center focus:border-tathir-dark-green focus:outline-none bg-white"
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-tathir-brown/70 mb-1 font-medium">Comprehensive</label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={catObj.numComprehensive}
                          onChange={e => {
                            const newCats = [...categories];
                            newCats[idx].numComprehensive = Number(e.target.value);
                            setCategories(newCats);
                          }}
                          className="border-2 border-tathir-brown/20 px-3 py-2 rounded-lg w-20 text-center focus:border-tathir-dark-green focus:outline-none bg-white"
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-tathir-brown/70 mb-1 font-medium">Total</label>
                        <div className="bg-tathir-dark-green text-tathir-beige font-bold px-3 py-2 rounded-lg min-w-[60px] text-center">
                          {catObj.numQuestions + catObj.numComprehensive}
                        </div>
                      </div>
                    </div>
                    
                    {categories.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setCategories(categories.filter((_, i) => i !== idx))} 
                        className="text-tathir-maroon hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-tathir-light-green/20 border-2 border-tathir-light-green/40 rounded-lg">
                <div className="text-tathir-brown">
                  <div className="font-bold text-lg">Total Questions: {categories.reduce((sum, c) => sum + c.numQuestions + c.numComprehensive, 0)}</div>
                  <div className="text-sm mt-1 text-tathir-brown/70">
                    Normal: {categories.reduce((sum, c) => sum + c.numQuestions, 0)} • 
                    Comprehensive: {categories.reduce((sum, c) => sum + c.numComprehensive, 0)}
                  </div>
                </div>
              </div>
              
              {categories.length < allCategories.length && (
                <button 
                  type="button" 
                  onClick={() => setCategories([...categories, { category: '', numQuestions: 3, numComprehensive: 2 }])} 
                  className="mt-3 text-tathir-dark-green hover:text-tathir-light-green bg-tathir-light-green/10 hover:bg-tathir-light-green/20 px-4 py-2 rounded-lg transition-colors font-medium border-2 border-tathir-light-green/30"
                >
                  + Add Category
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-tathir-brown font-medium mb-2">Time (minutes)</label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                  min={1}
                  max={120}
                  className="w-full border-2 border-tathir-brown/20 px-4 py-3 rounded-lg focus:border-tathir-dark-green focus:outline-none transition-colors bg-white"
                  required
                  placeholder="Enter time in minutes"
                />
              </div>
              
              <div>
                <label className="block text-tathir-brown font-medium mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border-2 border-tathir-brown/20 px-4 py-3 rounded-lg focus:border-tathir-dark-green focus:outline-none transition-colors bg-white"
                  required
                  placeholder="Select start time"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-tathir-maroon p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-tathir-dark-green hover:bg-tathir-light-green text-tathir-beige py-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-tathir-beige" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Challenge...
                </div>
              ) : (
                "Create Challenge"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 