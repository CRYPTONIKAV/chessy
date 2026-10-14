'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

/** Loads the saved game from the browser once the app has mounted */
export default function StoreHydration() {
    useEffect(() => {
        useGameStore.persist.rehydrate();
    }, []);
    return null;
}
