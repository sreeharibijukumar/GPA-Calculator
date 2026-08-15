import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mql = window.matchMedia(MOBILE_QUERY);
        const onChange = (e) => setIsMobile(e.matches);

        mql.addEventListener("change", onChange);

        setIsMobile(mql.matches);

        return () => {
            mql.removeEventListener("change", onChange);
        };
    }, []);
    return isMobile;
}