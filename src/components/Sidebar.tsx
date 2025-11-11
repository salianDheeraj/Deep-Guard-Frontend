// src/components/Sidebar.tsx
"use client";

import React, { useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusSquare, History, User, LogOut, ShieldCheck, LucideIcon } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const Sidebar = () => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Analysis', href: '/dashboard/new-analysis', icon: PlusSquare },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Account', href: '/dashboard/account', icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  useGSAP(() => {
    gsap.from(sidebarRef.current, {
      x: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });

    gsap.from(".nav-link-item", {
      opacity: 0,
      y: 10,
      stagger: 0.1,
      delay: 0.2, 
      ease: "power2.out"
    });
  }, { scope: sidebarRef });

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
    gsap.to(e.currentTarget, {
      scale: isEntering ? 1.02 : 1,
      x: isEntering ? 5 : 0,
      duration: 0.2,
      ease: "power1.inOut",
    });
  };

  return (
    <div ref={sidebarRef} className="w-64 h-screen bg-white shadow-md flex flex-col justify-between flex-shrink-0">
      <div>
        <div className="flex items-center justify-start p-6 border-b border-gray-100">
          <ShieldCheck size={28} className="text-blue-600" />
          <h1 className="text-xl font-bold ml-2 text-blue-600">Deepfake Detector</h1>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center py-3 px-6 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors nav-link-item 
                ${isActive(item.href) ? 'bg-gray-100 text-gray-900 font-medium' : ''}`}
              onMouseEnter={(e) => handleLinkHover(e, true)}
              onMouseLeave={(e) => handleLinkHover(e, false)}
            >
              <item.icon size={20} className="mr-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-6 border-t border-gray-100">
        <Link
          href="/logout"
          className="flex items-center py-3 px-6 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          onMouseEnter={(e) => handleLinkHover(e, true)}
          onMouseLeave={(e) => handleLinkHover(e, false)}
        >
          <LogOut size={20} className="mr-4" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
