"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IoGridOutline,
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoPersonOutline,
  IoCalendarOutline
} from "react-icons/io5";

const navItems = [
  { name: "แดชบอร์ด", href: "/admin", icon: IoGridOutline },
  { name: "เช็คอิน", href: "/admin/checkin", icon: IoCalendarOutline },
];

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const AdminLayout: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link href={item.href} passHref>
        <div
          className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200 group cursor-pointer
            ${isActive 
              ? "bg-[#30319D] text-white shadow-md" 
              : "text-gray-600 hover:bg-[#f3f4fd]"
            }
          `}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          <Icon className={`text-lg ${isActive ? "text-white" : "text-[#30319D] group-hover:text-[#30319D]"}`} />
          <span className={`ml-3 ${!isSidebarOpen && !isMobile ? "hidden" : "block"}`}>
            {item.name}
          </span>
          {isActive && !isSidebarOpen && !isMobile && (
            <span className="absolute left-0 bg-[#30319D] h-full w-1 rounded-r-lg"></span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex z-[99999] ">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[99999] bg-white shadow-lg transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-64" : "w-20"}
          ${isMobile ? (isMobileMenuOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          lg:static
          flex flex-col
        `}
        style={{
          height: isMobile ? "100vh" : "auto",
          top: isMobile ? 0 : undefined,
        }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Image src="/SMOLOGO.webp" alt="Logo" width={32} height={32} className="h-8 w-8" />
          {(isSidebarOpen || isMobileMenuOpen) && (
            <h1 className="ml-3 text-md font-bold text-[#30319D]">ระบบจัดการกิจกรรม</h1>
          )}
          {isMobile ? (
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <IoCloseOutline className="text-2xl text-gray-600" />
            </button>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-1 rounded-full hover:bg-gray-100"
            >
              {isSidebarOpen ? (
                <IoChevronBackOutline className="text-gray-600" />
              ) : (
                <IoChevronForwardOutline className="text-gray-600" />
              )}
            </button>
          )}
        </div>
        <nav className="mt-6 px-4 z-[99999] flex-1">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
          <div className="pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <IoLogOutOutline className="text-lg text-gray-500" />
              <span className={`ml-3 ${!isSidebarOpen && !isMobile ? "hidden" : "block"}`}>
                ออกจากระบบ
              </span>
            </button>
          </div>
        </nav>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col z-[99999] min-w-0">
        {/* Top navigation for mobile */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-6 z-[99999]">
          <div className="flex items-center">
            <button
              className="lg:hidden mr-4 text-gray-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <IoMenuOutline className="text-2xl" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 truncate max-w-[180px] sm:max-w-none">
              {navItems.find((item) => item.href === pathname)?.name || "แอดมิน"}
            </h1>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center mr-4">
              <div className="w-8 h-8 rounded-full bg-[#30319D]/10 flex items-center justify-center">
                <IoPersonOutline className="text-[#30319D]" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">แอดมิน</span>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden p-2 text-gray-600 hover:text-red-600"
            >
              <IoLogOutOutline className="text-xl" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto z-[99999]">
          <div className="text-sm text-gray-500 mb-4 sm:mb-6 hidden lg:block">
            <span>แอดมิน</span>
            <span className="mx-2">{">"}</span>
            <span className="text-[#30319D] font-medium">
              {navItems.find((item) => item.href === pathname)?.name || ""}
            </span>
          </div>
          <div className="w-full max-w-full">{children}</div>
        </main>
      </div>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-[99998] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;