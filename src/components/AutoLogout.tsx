'use strict';
'use client';

import { useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';

const TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours

export function AutoLogout() {
    const { data: session } = useSession();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!session) return;

        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                signOut({ redirectTo: "https://picks-mma.com/" });
            }, TIMEOUT_MS);
        };

        // Events to detect user activity
        const events = [
            'mousemove',
            'keydown',
            'click',
            'scroll',
            'touchstart',
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Initial timer set
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [session]);

    return null;
}
