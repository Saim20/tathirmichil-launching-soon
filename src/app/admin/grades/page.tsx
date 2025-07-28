"use client";
import { useAllUsers } from "@/hooks/useAllUsers";
import {
  setStudentGrade,
  GradeValue,
} from "@/lib/apis/grades";
import {
  getUserLiveTestStats,
  getUserLiveTestHistory,
  getUserLiveTestSummary,
  UserLiveTestStats,
} from "@/lib/apis/user-test-stats";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  FaSpinner,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaTrophy,
  FaClock,
  FaPercent,
  FaHashtag,
  FaExclamationTriangle,
  FaEye,
} from "react-icons/fa";

const GRADE_OPTIONS: GradeValue[] = ["A", "B", "C", "D", "F"];
const ITEMS_PER_PAGE = 10;

type SortField = "name" | "email" | "grade" | "updatedAt";
type SortDirection = "asc" | "desc";

export default function AdminGradesPage() {
  const { users, loading, error, refresh, updateUserLocal } = useAllUsers();
  const [selected, setSelected] = useState<{ [uid: string]: GradeValue | "" }>(
    {}
  );
  const [saving, setSaving] = useState<{ [uid: string]: boolean }>({});
  const [success, setSuccess] = useState<{ [uid: string]: boolean }>({});

  // Expandable rows state
  const [expandedRows, setExpandedRows] = useState<{ [uid: string]: boolean }>(
    {}
  );
  const [testStatsCache, setTestStatsCache] = useState<{
    [uid: string]: UserLiveTestStats[];
  }>({});
  const [loadingStats, setLoadingStats] = useState<{ [uid: string]: boolean }>(
    {}
  );

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeValue | "all">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade =
        gradeFilter === "all" || user.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "name":
          aVal = a.displayName || a.email;
          bVal = b.displayName || b.email;
          break;
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "grade":
          aVal = a.grade || "Z";
          bVal = b.grade || "Z";
          break;
        case "updatedAt":
          aVal = new Date(a.gradeUpdatedAt || 0).getTime();
          bVal = new Date(b.gradeUpdatedAt || 0).getTime();
          break;
      }

      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [users, searchTerm, gradeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gradeFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const handleAssign = async (uid: string) => {
    const grade = selected[uid];
    if (!grade) return;
    setSaving((s) => ({ ...s, [uid]: true }));
    try {
      await setStudentGrade(uid, grade as GradeValue);
      setSuccess((s) => ({ ...s, [uid]: true }));
      
      // Update local user cache immediately
      updateUserLocal(uid, {
        grade: grade as GradeValue,
        gradeUpdatedAt: new Date(),
      });
      
      setTimeout(() => setSuccess((s) => ({ ...s, [uid]: false })), 2000);
    } catch {
      // handle error
    } finally {
      setSaving((s) => ({ ...s, [uid]: false }));
    }
  };

  const toggleRowExpansion = async (uid: string) => {
    const isExpanding = !expandedRows[uid];
    setExpandedRows((prev) => ({ ...prev, [uid]: isExpanding }));

    // If expanding and we don't have stats yet, load them
    if (isExpanding && !testStatsCache[uid] && !loadingStats[uid]) {
      setLoadingStats((prev) => ({ ...prev, [uid]: true }));
      try {
        const response = await getUserLiveTestHistory(uid);
        if (response.success && response.data) {
          setTestStatsCache((prev) => ({ ...prev, [uid]: response.data! }));
        }
      } catch (error) {
        console.error("Failed to load test stats for user:", uid, error);
      } finally {
        setLoadingStats((prev) => ({ ...prev, [uid]: false }));
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getTabSwitchIcon = (count?: number) => {
    if (!count || count === 0) return <FaEye className="text-green-500 text-xs" />;
    return <FaExclamationTriangle className="text-red-500 text-xs" />;
  };

  const getTabSwitchColor = (count?: number) => {
    if (!count || count === 0) return "text-green-500";
    if (count <= 3) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-2 bg-tathir-beige">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-tathir-dark-green">
          Student Grades
        </h1>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-tathir-dark-green text-tathir-beige rounded-lg font-semibold hover:bg-green-800 transition shadow-md flex items-center gap-2"
        >
          {loading && <FaSpinner className="animate-spin" />} Refresh Students
        </button>
      </div>

      {/* Filters and Search */}
      <div className="w-full max-w-6xl bg-white/90 p-4 rounded-xl shadow-lg border border-tathir-dark-green/10 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-tathir-dark-green mb-1">
              Search Students
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full border border-tathir-dark-green/30 rounded-lg px-3 py-2 bg-tathir-beige/40 focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/40 focus:border-tathir-dark-green transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-tathir-dark-green mb-1">
              Filter by Grade
            </label>
            <select
              className="w-full border border-tathir-dark-green/30 rounded-lg px-3 py-2 bg-tathir-beige/40 focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/40 focus:border-tathir-dark-green transition"
              value={gradeFilter}
              onChange={(e) =>
                setGradeFilter(e.target.value as GradeValue | "all")
              }
            >
              <option value="all">All Grades</option>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-tathir-dark-green">
              Showing {paginatedUsers.length} of {filteredAndSortedUsers.length}{" "}
              students
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white/90 p-6 rounded-2xl shadow-xl border border-tathir-dark-green/10">
        {loading ? (
          <div className="flex items-center gap-2 text-tathir-dark-green font-medium">
            <FaSpinner className="animate-spin" /> Loading students...
          </div>
        ) : error ? (
          <div className="text-red-500 font-medium">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border mt-2 bg-white rounded-xl overflow-hidden text-sm">
                <thead>
                  <tr className="bg-tathir-dark-green text-tathir-beige">
                    <th className="py-2 px-4 text-center w-12">Expand</th>
                    <th
                      className="py-2 px-4 text-left cursor-pointer hover:bg-green-800 transition"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Name {getSortIcon("name")}
                      </div>
                    </th>
                    <th
                      className="py-2 px-4 text-left cursor-pointer hover:bg-green-800 transition"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        Email {getSortIcon("email")}
                      </div>
                    </th>
                    <th
                      className="py-2 px-4 text-center cursor-pointer hover:bg-green-800 transition"
                      onClick={() => handleSort("grade")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Current Grade {getSortIcon("grade")}
                      </div>
                    </th>
                    <th
                      className="py-2 px-4 text-center cursor-pointer hover:bg-green-800 transition"
                      onClick={() => handleSort("updatedAt")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Last Updated {getSortIcon("updatedAt")}
                      </div>
                    </th>
                    <th className="py-2 px-4 text-center">Assign Grade</th>
                    <th className="py-2 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <React.Fragment key={user.uid}>
                      <tr
                        key={user.uid}
                        className="border-b hover:bg-tathir-beige/40 transition"
                      >
                        <td className="py-2 px-4 text-center">
                          <button
                            onClick={() => toggleRowExpansion(user.uid)}
                            className="p-1 hover:bg-tathir-beige/60 rounded transition"
                          >
                            {expandedRows[user.uid] ? (
                              <FaChevronUp className="text-tathir-dark-green" />
                            ) : (
                              <FaChevronDown className="text-tathir-dark-green" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-4 font-medium">
                          {user.displayName || user.email}
                        </td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4 font-bold text-lg text-center">
                          {user.grade || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-xs text-gray-500 text-center">
                          {user.gradeUpdatedAt ? (
                            user.gradeUpdatedAt.toLocaleString()
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <select
                            className="border rounded px-2 py-1 focus:ring-2 focus:ring-tathir-dark-green/40 focus:border-tathir-dark-green"
                            value={selected[user.uid] || ""}
                            onChange={(e) =>
                              setSelected((s) => ({
                                ...s,
                                [user.uid]: e.target.value as GradeValue,
                              }))
                            }
                          >
                            <option value="">Select</option>
                            {GRADE_OPTIONS.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button
                            className="bg-tathir-dark-green text-tathir-beige px-3 py-1 rounded hover:bg-green-800 disabled:opacity-60 flex items-center gap-2 mx-auto"
                            disabled={!selected[user.uid] || saving[user.uid]}
                            onClick={() => handleAssign(user.uid)}
                          >
                            {saving[user.uid] ? (
                              <FaSpinner className="animate-spin" />
                            ) : success[user.uid] ? (
                              "Saved!"
                            ) : (
                              "Assign"
                            )}
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Row Content */}
                      {expandedRows[user.uid] && (
                        <tr
                          key={`${user.uid}-expanded`}
                          className="bg-tathir-beige/20"
                        >
                          <td colSpan={7} className="p-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <h4 className="text-lg font-semibold text-tathir-dark-green mb-3 flex items-center gap-2">
                                <FaTrophy className="text-yellow-500" />
                                Live Test Performance
                              </h4>

                              {loadingStats[user.uid] ? (
                                <div className="flex items-center gap-2 text-tathir-dark-green">
                                  <FaSpinner className="animate-spin" />
                                  Loading test statistics...
                                </div>
                              ) : testStatsCache[user.uid] && testStatsCache[user.uid].length > 0 ? (
                                <div className="space-y-4">
                                  {/* Summary Stats for latest test */}
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-tathir-beige/30 p-3 rounded-lg text-center">
                                      <div className="text-2xl font-bold text-tathir-dark-green">
                                        {testStatsCache[user.uid].length}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Total Tests
                                      </div>
                                    </div>
                                    <div className="bg-tathir-beige/30 p-3 rounded-lg text-center">
                                      <div className="text-2xl font-bold text-tathir-dark-green">
                                        {Math.round(
                                          testStatsCache[user.uid][0].accuracy
                                        )}
                                        %
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Latest Accuracy
                                      </div>
                                    </div>
                                    <div className="bg-tathir-beige/30 p-3 rounded-lg text-center">
                                      <div className="text-2xl font-bold text-tathir-dark-green">
                                        {testStatsCache[user.uid][0].rank || "-"}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Latest Rank
                                      </div>
                                    </div>
                                    <div className="bg-tathir-beige/30 p-3 rounded-lg text-center">
                                      <div className="text-2xl font-bold text-tathir-dark-green">
                                        {testStatsCache[user.uid][0].totalCorrect}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Correct Answers
                                      </div>
                                    </div>
                                    <div className="bg-tathir-beige/30 p-3 rounded-lg text-center">
                                      <div className={`text-2xl font-bold ${getTabSwitchColor(testStatsCache[user.uid][0].tabSwitchCount)}`}>
                                        {testStatsCache[user.uid][0].tabSwitchCount || 0}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Tab Switches
                                      </div>
                                    </div>
                                  </div>

                                  {/* All Test Results */}
                                  <div>
                                    <h5 className="font-medium text-tathir-dark-green mb-2">
                                      Test History (Latest {testStatsCache[user.uid].length} Results)
                                    </h5>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs border border-gray-200 rounded-lg">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="p-2 text-left">
                                              Date
                                            </th>
                                            <th className="p-2 text-center">
                                              Score
                                            </th>
                                            <th className="p-2 text-center">
                                              Accuracy
                                            </th>
                                            <th className="p-2 text-center">
                                              Rank
                                            </th>
                                            <th className="p-2 text-center">
                                              Percentile
                                            </th>
                                            <th className="p-2 text-center">
                                              Time
                                            </th>
                                            <th className="p-2 text-center">
                                              Tab Switches
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {testStatsCache[user.uid].map((testResult, index) => (
                                            <tr key={index} className="border-t">
                                              <td className="p-2">
                                                {testResult.submittedAt.toLocaleDateString()}
                                              </td>
                                              <td className="p-2 text-center font-medium">
                                                {testResult.totalCorrect}/{testResult.totalScore}
                                              </td>
                                              <td className="p-2 text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                  <FaPercent className="text-xs" />
                                                  {Math.round(testResult.accuracy)}%
                                                </span>
                                              </td>
                                              <td className="p-2 text-center">
                                                {testResult.rank ? (
                                                  <span className="flex items-center justify-center gap-1">
                                                    <FaHashtag className="text-xs" />
                                                    {testResult.rank}
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </td>
                                              <td className="p-2 text-center">
                                                {testResult.percentile ? (
                                                  <span className="flex items-center justify-center gap-1">
                                                    <FaPercent className="text-xs" />
                                                    {testResult.percentile}%
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </td>
                                              <td className="p-2 text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                  <FaClock className="text-xs" />
                                                  {formatTime(testResult.timeTaken)}
                                                </span>
                                              </td>
                                              <td className="p-2 text-center">
                                                <span className={`flex items-center justify-center gap-1 ${getTabSwitchColor(testResult.tabSwitchCount)}`}>
                                                  {getTabSwitchIcon(testResult.tabSwitchCount)}
                                                  {testResult.tabSwitchCount || 0}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-500 text-center py-4">
                                  No live test results found for this student.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-tathir-dark-green text-tathir-beige rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <FaChevronLeft /> Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            currentPage === pageNum
                              ? "bg-tathir-dark-green text-tathir-beige"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-tathir-dark-green text-tathir-beige rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
