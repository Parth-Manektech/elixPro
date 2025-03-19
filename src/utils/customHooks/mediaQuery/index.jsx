import { useState, useEffect } from 'react';

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return;
        }

        const mediaQueryList = window.matchMedia(query);
        const listener = (event) => {
            setMatches(event.matches);
        };

        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', listener);
        } else {
            mediaQueryList.addListener(listener);
        }
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
