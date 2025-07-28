"use client";
import React, { useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/lib/auth/auth-provider";
import NotificationBell from "@/components/NotificationBell";
import {
  FaHome,
  FaGraduationCap,
  FaUsers,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaGamepad,
  FaTimes,
  FaTrophy,
  FaMedal,
  FaCalendar,
  FaClipboardList,
  FaVideo,
} from "react-icons/fa";
import { bloxat } from "@/components/fonts";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isSubscribed = authContext?.userProfile?.isSubscribed || false;
  const isPassed = authContext?.userProfile?.isPassed || false;
  const isAdmin = authContext?.userProfile?.role === "admin" || false;
  const logOut = authContext?.logOut;
  const router = useRouter();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  interface NavItem {
    name: string;
    route: string;
    icon: React.ReactNode;
    isPremium?: boolean;
    isPassingRequired?: boolean;
    forUnsubscribed?: boolean; 
  };

  const navItems: Array<NavItem> = [
    { name: "Overview", route: "/student", icon: <FaHome />, isPremium: true },
    {
      name: "Test",
      route: "/test",
      icon: <FaGraduationCap />,
      isPremium: false,
    },
    {
      name: "Apply to Batch",
      route: "/form",
      icon: <FaClipboardList />,
      isPremium: false,
      isPassingRequired:true,
      forUnsubscribed: true,
    },
    {
      name: "Apply for Session",
      route: "/student/apply-session",
      icon: <FaVideo />,
      isPremium: true,
    },
    {
      name: "Class Records",
      route: "/student/classes",
      icon: <FaVideo />,
      isPremium: true,
    },
    {
      name: "Leaderboard",
      route: "/student/leaderboards",
      icon: <FaTrophy />,
      isPremium: true,
    },
    {
      name: "Announcements",
      route: "/student/announcements",
      icon: <FaBullhorn />,
      isPremium: true,
    },
    { name: "Settings", route: "/settings", icon: <FaCog />, isPremium: true },
    {
      name: "Enroll",
      route: "/batch",
      icon: <FaCalendar />,
      isPremium: false,
      isPassingRequired: true,
      forUnsubscribed: true,
    },
  ];

  // Determines if a nav item should be visible in the sidebar
  function shouldDisplayNavItem(item: NavItem): boolean {
    // Hide items meant for unsubscribed users if user is subscribed
    if (item.forUnsubscribed === true && isSubscribed) {
      return false;
    }
    
    return true;
  }

  // Determines if a nav item should be disabled (shown but not clickable)
  function isNavItemDisabled(item: NavItem): boolean {
    // Premium items are disabled for non-admin, non-subscribed users
    if (item.isPremium && !isSubscribed && !isAdmin) {
      return true;
    }
    if(item.isPassingRequired && !isPassed && !isAdmin) {
      return true;
    }

    // unless they're specifically for unsubscribed users
    return (item.isPremium === true) && !(isSubscribed || isAdmin) && !(item.forUnsubscribed === true);
  }

  // Gets the appropriate nav item component based on its state
  function getNavItemComponent(item: NavItem) {
    const isDisabled = isNavItemDisabled(item);
    const isActive = pathname.startsWith("/student") 
      ? pathname === item.route 
      : pathname.startsWith(item.route);

    if (isDisabled) {
      return (
        <div
          className="flex items-center gap-3 py-3 px-4 rounded-lg border-2 border-transparent
                     bg-tathir-maroon/40 text-tathir-cream/60 cursor-not-allowed opacity-60"
          title="Locked"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium">{item.name}</span>
          <span className="ml-auto text-lg" title="Locked">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-5 h-5 text-tathir-cream/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6-6V9a6 6 0 10-12 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-2a4 4 0 118 0v2H8V9z"
              />
            </svg>
          </span>
        </div>
      );
    }

    return (
      <Link href={item.route}>
        <div
          className={`
            flex items-center gap-3 py-3 px-4 transition-all duration-300 cursor-pointer
            rounded-lg border-2 hover:border-tathir-cream group
            ${isActive
              ? "bg-tathir-maroon border-tathir-cream text-white scale-[1.02] shadow-lg"
              : "border-transparent hover:bg-tathir-cream/10"
            }
          `}
        >
          <span
            className={`text-xl ${
              isActive
                ? "text-tathir-cream"
                : "text-tathir-cream group-hover:text-tathir-light-green"
            }`}
          >
            {item.icon}
          </span>
          <span
            className={`font-medium ${
              isActive
                ? "text-tathir-cream"
                : "text-tathir-cream group-hover:text-tathir-light-green"
            }`}
          >
            {item.name}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen bg-tathir-beige relative">
      {/* Sidebar */}
      <aside
        className={`
                    fixed top-0 left-0 z-40 h-full w-[280px] sm:w-72 bg-tathir-dark-green text-tathir-beige
                    transform transition-transform duration-300 border-r-4 border-tathir-maroon
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                    overflow-y-auto
                `}
        style={{ boxShadow: '4px 0 0 0 rgb(from var(--color-tathir-maroon) r g b / 0.5)' }}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-tathir-cream hover:text-tathir-light-green p-2"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div
          onClick={() => router.push("/student")}
          className="flex items-center justify-center gap-3 pt-8 cursor-pointer group"
        >
          <FaGamepad className="text-4xl text-tathir-cream group-hover:text-tathir-light-green transition-colors" />
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-tathir-cream group-hover:text-tathir-light-green transition-colors tracking-wide">
            Student
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems
              .filter(shouldDisplayNavItem)
              .map((item) => (
                <li key={item.name}>
                  {getNavItemComponent(item)}
                </li>
              ))}
          </ul>
        </nav>

        {/* Bottom Buttons */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-tathir-dark-green border-t-2 border-tathir-maroon/30 mt-8 space-y-2">
          <button
            className="flex items-center gap-3 w-full py-3 px-4 bg-tathir-brown text-tathir-cream rounded-lg 
                        cursor-pointer hover:bg-tathir-maroon transition-colors duration-300 border-2 border-transparent
                        hover:border-tathir-cream active:scale-95"
          >
            <FaUserCircle className="text-xl" />
            <span className="font-medium">Profile</span>
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full py-3 px-4 bg-tathir-maroon text-tathir-cream rounded-lg 
                        cursor-pointer hover:bg-tathir-brown transition-colors duration-300 border-2 border-transparent
                        hover:border-tathir-cream active:scale-95"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Dim background when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 min-h-screen transition-all duration-300 relative">
        {/* Header */}
        <header 
          className="flex justify-between items-center h-16 px-4 sm:px-6 bg-tathir-dark-green border-b-4 border-tathir-maroon fixed top-0 right-0 lg:left-72 left-0 z-20"
          style={{ boxShadow: '0 4px 0 0 rgb(from var(--color-tathir-maroon) r g b / 0.5)' }}
        >
          {/* Menu button on mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-tathir-cream hover:text-tathir-light-green p-2 -ml-2"
          >
            <FaBars className="w-6 h-6" />
          </button>

          {/* User Info and Notifications */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <FaUserCircle className="text-tathir-cream text-xl" />
                <span className="text-base sm:text-xl text-tathir-cream font-medium hidden sm:block">
                  {user?.displayName}
                </span>
              </div>
            </div>
            {/* Coins */}
            <div className="flex items-center gap-2 group relative">
              <FaMedal className="text-yellow-400 text-xl" />
              <div
                className={`text-xl font-bold text-tathir-cream mb-1 ${bloxat.className}`}
              >
                {authContext?.coinBalance || 0}
              </div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-tathir-maroon text-tathir-cream text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Michilcoins
              </div>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <section className="mt-16">
          <div className="max-w-full lg:max-w-[calc(100vw-19rem)] mx-auto overflow-x-hidden px-4 py-6">
            {children}
          </div>
        </section>
      </main>

      {/* Logout Modal */}
            {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-tathir-dark-green border-4 border-tathir-maroon p-6 sm:p-8 rounded-lg max-w-[90%] sm:max-w-md w-full"
            style={{ boxShadow: '8px 8px 0 0 rgb(from var(--color-tathir-maroon) r g b / 0.5)' }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-tathir-cream text-center mb-6 sm:mb-8">
              Are you sure you want to logout?
            </h3>
            <div className="flex justify-center gap-3 sm:gap-4">
              <button
                className="px-4 sm:px-6 py-2 bg-tathir-maroon text-tathir-cream rounded-lg cursor-pointer
                              hover:bg-tathir-brown transition-colors duration-300 border-2 border-transparent
                              hover:border-tathir-cream active:scale-95"
                onClick={async () => {
                  try {
                    setShowLogoutModal(false);
                    if (logOut) {
                      await logOut();
                      router.push("/login");
                    }
                  } catch (error) {
                    console.error("Logout failed:", error);
                    // Optionally show an error message to the user
                  }
                }}
              >
                Yes, Logout
              </button>
              <button
                className="px-4 sm:px-6 py-2 bg-tathir-cream text-tathir-maroon rounded-lg cursor-pointer
                              hover:bg-tathir-beige transition-colors duration-300 border-2 border-transparent
                              hover:border-tathir-maroon active:scale-95"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
