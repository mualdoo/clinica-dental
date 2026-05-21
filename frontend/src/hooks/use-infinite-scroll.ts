import { useEffect, useRef } from 'react'

export function useInfiniteScroll(
    hasNextPage: boolean | undefined,
    fetchNextPage: () => void
): React.RefObject<HTMLDivElement> {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
            },
            { threshold: 0.5 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [hasNextPage, fetchNextPage])
    return ref as React.RefObject<HTMLDivElement>
}
