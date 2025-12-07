"use client";

import React, { useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusSquare, History, User, LogOut, ShieldCheck, LucideIcon } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import UserProfileCard from './UserProfileCard';
import ThemeToggleButton from './ThemeToggleButton';

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
    // 4. FIXED LOGOUT (only update needed)
    // ================================
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
            className={styles.sidebar}
        >
            <div>
                {/* Logo */}
                <div className={styles.logoContainer}>
                    <ShieldCheck size={28} className={`${styles.logoIcon} logo-shield-icon`} />
                    <h1 className={styles.logoText}>Deep-Guard</h1>
                </div>

                {/* Nav */}
                <nav ref={navRef} className={styles.nav}>
                    <div
                        ref={indicatorRef}
                        className={styles.indicator}
                        style={{ transform: 'translateY(0px)' }}
                    />

                    {navItems.map((item, index) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            ref={(el) => { itemRefs.current[index] = el; }}
                            className={`${styles.navItem} nav-link-item 
                                ${isActive(item.href)
                                    ? styles.navItemActive
                                    : styles.navItemInactive}`}
                            onMouseEnter={(e) => handleLinkHover(e, true)}
                            onMouseLeave={(e) => handleLinkHover(e, false)}
                        >
                            <item.icon size={20} className={styles.navIcon} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className={styles.bottomSection}>

                <div className={styles.themeToggleContainer}>
                    <ThemeToggleButton />
                </div>

                <div className={styles.userProfileContainer}>
                    <UserProfileCard />
                </div>

                <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    <LogOut size={20} className="mr-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
