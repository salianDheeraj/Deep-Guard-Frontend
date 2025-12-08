"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function DashboardWelcome() {
    const [name, setName] = useState("User");

    useEffect(() => {
        apiFetch('/api/account/me')
            .then(res => res.json())
            .then(data => {
                if (data.name) setName(data.name.split(' ')[0]); // First name only
            })
            .catch(() => { });
    }, []);

    useGSAP(() => {
        gsap.from(".welcome-text", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });
        gsap.from(".welcome-sub", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            delay: 0.2,
            ease: "power3.out"
        });
    }, []);

    const hours = new Date().getHours();
    const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="mb-6">
            <h1 className="welcome-text text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-pink-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                {greeting}, {name}! 👋
            </h1>
            <p className="welcome-sub text-gray-500 dark:text-gray-400">
                Ready to detect some deepfakes today?
            </p>
        </div>
    );
}
