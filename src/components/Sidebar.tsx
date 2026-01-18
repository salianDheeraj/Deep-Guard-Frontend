"use client";

import React, { useRef, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutGrid,
    ScanEye,
    FileClock,
    CircleUser,
    LogOut,
    ShieldCheck,
    LucideIcon,
    Menu,
    X,
    Siren          // Added
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import UserProfileCard from './UserProfileCard';
import ThemeToggleButton from './ThemeToggleButton';
import SidebarGuide from './SidebarGuide'; // Added

import styles from '@/styles/Sidebar.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false); // State for mobile menu

    const sidebarRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const navItems: NavItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { name: 'New Analysis', href: '/dashboard/new-analysis', icon: ScanEye },
        { name: 'History', href: '/dashboard/history', icon: FileClock },
        { name: 'Account', href: '/dashboard/account', icon: CircleUser },
        // Added to fill empty space
        { name: 'Report Cybercrime', href: 'https://cybercrime.gov.in', icon: Siren },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // GSAP Animations
    useGSAP(() => {
        // Only run the entrance animation if it's desktop OR if it's the first load
        // We use a matchMedia query to prevent GSAP from fighting CSS transitions on mobile resize
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            gsap.from(sidebarRef.current, {
                x: -100,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
            });

            gsap.fromTo(".logo-shield-icon",
                { scale: 0.5, opacity: 0, rotation: -45 },
                { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: "back.out(2)", delay: 0.2 }
            );

            gsap.from(".nav-link-item", {
                opacity: 0,
                y: 10,
                stagger: 0.1,
                delay: 1.0,
                duration: 0.5,
                ease: "power2.out"
            });
        });

    }, { scope: sidebarRef });

    // Indicator Animation Logic
    useEffect(() => {
        const activeIndex = navItems.findIndex(item => isActive(item.href));
        const activeElement = itemRefs.current[activeIndex];

        if (activeElement && indicatorRef.current && navRef.current) {
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
    }, [pathname, navItems, isMobileOpen]); // Added isMobileOpen dependency to recalculate when drawer opens

    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
        gsap.to(e.currentTarget, {
            scale: isEntering ? 1.02 : 1,
            x: isEntering ? 5 : 0,
            duration: 0.2,
            ease: "power1.inOut",
        });
    };

    itemRefs.current = [];

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
        <>
            {/* --- MOBILE HAMBURGER BUTTON --- */}
            {/* Visible only on mobile (md:hidden) */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-[100] p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-200"
                aria-label="Toggle Menu"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* --- MOBILE OVERLAY BACKDROP --- */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* --- SIDEBAR CONTAINER --- */}
            {/* Responsive Classes logic:
                1. Fixed position on mobile (inset-y-0 left-0) to act as a drawer.
                2. Sticky/Relative on Desktop (md:relative) to maintain original layout.
                3. Translate logic: On mobile, slide in/out. On desktop, always show (translate-x-0).
            */}
            <div
                ref={sidebarRef}
                className={`
                    ${styles.sidebar} 
                    fixed md:relative inset-y-0 left-0 z-[100]
                    h-screen
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
                `}
            >
                <div>
                    {/* --- LOGO SECTION --- */}
                    <div className={styles.logoContainer}>
                        <ShieldCheck size={28} className={`${styles.logoIcon} logo-shield-icon !text-blue-600 dark:!text-cyan-400`} />

                        <h1 className={`${styles.logoText} !bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500`}>
                            Deep-Guard
                        </h1>
                    </div>

                    {/* --- NAV SECTION --- */}
                    <nav ref={navRef} className={styles.nav}>
                        <div
                            ref={indicatorRef}
                            className={`${styles.indicator} !bg-gradient-to-b !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500`}
                            style={{ transform: 'translateY(0px)' }}
                        />

                        {navItems.map((item, index) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    target={item.href.startsWith('http') ? '_blank' : undefined}
                                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    ref={(el) => { itemRefs.current[index] = el; }}
                                    className={`${styles.navItem} nav-link-item group`}
                                    onMouseEnter={(e) => handleLinkHover(e, true)}
                                    onMouseLeave={(e) => handleLinkHover(e, false)}
                                >
                                    <item.icon
                                        size={20}
                                        className={`${styles.navIcon} 
                                            ${active
                                                ? '!text-blue-600 dark:!text-cyan-400'
                                                : 'group-hover:!text-blue-500 dark:group-hover:!text-cyan-300'
                                            }`}
                                    />

                                    <span className={
                                        active
                                            ? `!bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500 font-medium`
                                            : `group-hover:!text-blue-600 dark:group-hover:!text-cyan-400`
                                    }>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* --- INFO GUIDE CARD --- */}
                <div className="mt-auto">
                    <SidebarGuide />
                </div>

                {/* --- BOTTOM SECTION --- */}
                <div className={styles.bottomSection}>
                    <div className={styles.themeToggleContainer}>
                        <ThemeToggleButton />
                    </div>

                    <div className={styles.userProfileContainer}>
                        <UserProfileCard />
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`${styles.logoutButton} group transition-all duration-300`}
                    >
                        <LogOut
                            size={20}
                            className="mr-4 group-hover:!text-blue-600 dark:group-hover:!text-cyan-400"
                        />
                        <span className="group-hover:!bg-clip-text group-hover:!text-transparent group-hover:!bg-gradient-to-r group-hover:!from-blue-600 group-hover:!to-pink-500 dark:group-hover:!from-cyan-400 dark:group-hover:!to-purple-500">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;