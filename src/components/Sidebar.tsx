"use client";

import React, { useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusSquare, History, User, LogOut, ShieldCheck, LucideIcon } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import UserProfileCard from './UserProfileCard';
import ThemeToggleButton from './ThemeToggleButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const sidebarRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const navItems: NavItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'New Analysis', href: '/dashboard/new-analysis', icon: PlusSquare },
        { name: 'History', href: '/dashboard/history', icon: History },
        { name: 'Account', href: '/dashboard/account', icon: User },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    // ================================
    // 1. Initial load animations
    // ================================
    useGSAP(() => {
        gsap.from(sidebarRef.current, {
            x: -100,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
        });

        gsap.fromTo(".logo-shield-icon",
            { scale: 0.5, opacity: 0, rotation: -45 },
            {
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.6,
                ease: "back.out(2)",
                delay: 0.2
            }
        );

        gsap.from(".nav-link-item", {
            opacity: 0,
            y: 10,
            stagger: 0.1,
            delay: 1.0,
            duration: 0.5,
            ease: "power2.out"
        });

    }, { scope: sidebarRef });

    // ================================
    // 2. Active indicator movement
    // ================================
    useEffect(() => {
        if (navRef.current) {
            const activeIndex = navItems.findIndex(item => isActive(item.href));
            const activeElement = itemRefs.current[activeIndex];

            if (activeElement && indicatorRef.current) {
                const navTop = navRef.current.getBoundingClientRect().top;
                const elementTop = activeElement.getBoundingClientRect().top;
                const topPosition = elementTop - navTop;

                gsap.to(indicatorRef.current, {
                    y: topPosition,
                    height: activeElement.offsetHeight,
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.inOut",
                });
            } else if (indicatorRef.current) {
                gsap.to(indicatorRef.current, { opacity: 0, duration: 0.2 });
            }
        }
    }, [pathname, navItems]);

    // ================================
    // 3. Hover animation
    // ================================
    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
        gsap.to(e.currentTarget, {
            scale: isEntering ? 1.02 : 1,
            x: isEntering ? 5 : 0,
            duration: 0.2,
            ease: "power1.inOut",
        });
    };

    itemRefs.current = [];

    // ================================
    // 4. Proper logout: server + client
    // ----------------------------
    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            router.push("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div
            ref={sidebarRef}
            className="w-64 h-screen bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between flex-shrink-0 border-r border-gray-100 dark:border-gray-800 transition-colors duration-300"
        >
            <div>
                {/* Logo */}
                <div className="flex items-center justify-start p-6 border-b border-gray-100 dark:border-gray-800">
                    <ShieldCheck size={28} className="text-blue-600 dark:text-cyan-400 logo-shield-icon" />
                    <h1 className="text-xl font-bold ml-2 text-blue-600 dark:text-white">Deep-Guard</h1>
                </div>

                {/* Nav */}
                <nav ref={navRef} className="mt-6 relative">
                    <div
                        ref={indicatorRef}
                        className="absolute left-0 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-r-lg opacity-0"
                        style={{ transform: 'translateY(0px)' }}
                    />

                    {navItems.map((item, index) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            ref={(el) => { itemRefs.current[index] = el; }}
                            className={`flex items-center py-3 px-6 text-gray-600 dark:text-gray-400 transition-colors nav-link-item relative z-10 
                                ${isActive(item.href)
                                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium'
                                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}`}
                            onMouseEnter={(e) => handleLinkHover(e, true)}
                            onMouseLeave={(e) => handleLinkHover(e, false)}
                        >
                            <item.icon size={20} className="mr-4" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">

                <div className="flex justify-center pb-2">
                    <ThemeToggleButton />
                </div>

                {/* User Profile */}
                <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors">
                    <UserProfileCard />
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    // CHANGED: Red in Light Mode | Orange in Dark Mode
                    className="w-full flex items-center py-2 px-3 rounded-lg transition-colors
                               text-red-500 hover:bg-red-50 hover:text-red-700
                               dark:text-orange-500 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
                >
                    <LogOut size={20} className="mr-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;