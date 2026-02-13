'use client'

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    useEffect(() => {
        if (key) {
            posthog.init(key, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            });
        }
    }, [key]);

    if (!key) {
        return <>{children}</>;
    }

    return <PHProvider client={posthog}>{children}</PHProvider>;
}