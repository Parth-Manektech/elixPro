import { useState, useEffect } from 'react';

function useMediaQuery(query) {
    // Initialize the state with the match status
    const [matches, setMatches] = useState(() => {
        // Check if window and matchMedia are available (e.g., not in SSR)
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        // Ensure matchMedia is available
        if (typeof window === 'undefined' || !window.matchMedia) {
            return;
        }

        const mediaQueryList = window.matchMedia(query);

        // Update the state whenever the media query's status changes
        const listener = (event) => {
            setMatches(event.matches);
        };

        // Add the listener for changes
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', listener);
        } else {
            // Fallback for older browsers
            mediaQueryList.addListener(listener);
        }

        // Clean up the listener on unmount
        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener('change', listener);
            } else {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}

export default useMediaQuery;
