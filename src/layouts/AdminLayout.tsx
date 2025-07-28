"use client";
import React, { useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/lib/auth/auth-provider";
import {
  FaUsers,
  FaBlog,
  FaShoppingBag,
  FaQuestion,
  FaClipboardList,
  FaCheckSquare,
  FaUserCheck,
  FaLayerGroup,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaBars,
  FaCrown,
  FaTimes,
  FaVideo,
  FaUserGraduate,
  FaDollarSign,
} from "react-icons/fa";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
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

  const navItems = [
    { name: "Students", route: "/admin", icon: <FaUsers /> },
    { name: "Blogs", route: "/admin/blogs", icon: <FaBlog /> },
    { name: "Orders", route: "/admin/orders", icon: <FaShoppingBag /> },
    { name: "Payments", route: "/admin/payments", icon: <FaDollarSign /> },
    { name: "Add Questions", route: "/admin/questions", icon: <FaQuestion /> },
    {
      name: "All Questions",
      route: "/admin/all-questions",
      icon: <FaQuestion />,
    },
    {
      name: "Create Test",
      route: "/admin/create-tests",
      icon: <FaClipboardList />,
    },
    { name: "Evaluate Test", route: "/admin/tests", icon: <FaCheckSquare /> },
    { name: "Approval", route: "/admin/approval", icon: <FaUserCheck /> },
    { name: "Grades", route: "/admin/grades", icon: <FaUserGraduate /> },
    {
      name: "Create Batch",
      route: "/admin/create-batch",
      icon: <FaLayerGroup />,
    },
    {
      name: "Announcements",
      route: "/admin/announcements",
      icon: <FaBullhorn />,
    },
    { name: "Sessions", route: "/admin/sessions", icon: <FaVideo /> },
    { name: "Class Records", route: "/admin/classes", icon: <FaVideo /> },
    { name: "Settings", route: "/admin/settings", icon: <FaCog /> },
  ];

  return (
    <div className="flex min-h-screen bg-tathir-beige relative">
      {/* Sidebar */}
      <aside
        className={`
                    fixed top-0 left-0 z-40 h-full w-[280px] sm:w-72 bg-tathir-dark-green text-tathir-beige
                    transform transition-transform duration-300 border-r-4 border-tathir-maroon
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                    overflow-y-auto flex flex-col
                `}
        style={{ boxShadow: '4px 0 0 0 rgb(from var(--color-tathir-maroon) r g b / 0.5)' }}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-tathir-cream hover:text-tathir-light-green p-2 z-10"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div
          onClick={() => router.push("/admin")}
          className="flex items-center justify-center gap-3 py-8 px-4 cursor-pointer group flex-shrink-0"
        >
          <FaCrown className="text-4xl text-tathir-cream group-hover:text-tathir-light-green transition-colors" />
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-tathir-cream group-hover:text-tathir-light-green transition-colors tracking-wide">
            Admin
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 pb-4 flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.route}>
                  <div
                    className={`
                                            flex items-center gap-3 py-3 px-4 transition-all duration-300 cursor-pointer
                                            rounded-lg border-2 hover:border-tathir-cream group
                                            ${
                                              pathname === item.route
                                                ? "bg-tathir-maroon border-tathir-cream text-white scale-[1.02] shadow-lg"
                                                : "border-transparent hover:bg-tathir-cream/10"
                                            }
                                        `}
                  >
                    <span
                      className={`text-xl ${
                        pathname === item.route
                          ? "text-tathir-cream"
                          : "text-tathir-cream group-hover:text-tathir-light-green"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`font-medium ${
                        pathname === item.route
                          ? "text-tathir-cream"
                          : "text-tathir-cream group-hover:text-tathir-light-green"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Logout Button */}
          <div className="mt-6 pt-4 border-t-2 border-tathir-maroon/30">
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
        </nav>
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
          className="flex justify-between items-center h-16 px-4 sm:px-6 bg-tathir-dark-green border-b-4 border-tathir-maroon fixed top-0 right-0 lg:left-72 left-0 z-20 w-auto"
          style={{ boxShadow: '0 4px 0 0 rgb(from var(--color-tathir-maroon) r g b / 0.5)' }}
        >
          {/* Menu button on mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-tathir-cream hover:text-tathir-light-green p-2 -ml-2"
          >
            <FaBars className="w-6 h-6" />
          </button>

          {/* Admin Name */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <FaCrown className="text-tathir-cream text-xl" />
            <span className="text-base sm:text-xl text-tathir-cream font-medium hidden sm:block" title="Admin">
              {user?.displayName}
            </span>
          </div>
        </header>
        
        {/* Page Content */}
        <section className="mt-16">
          <div className="max-w-full lg:max-w-[calc(100vw-19rem)] mx-auto overflow-x-hidden">
            {children}
          </div>
        </section>
      </main>

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

export default AdminLayout;
