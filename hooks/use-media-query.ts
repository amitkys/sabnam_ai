import * as React from "react"

export function useMediaQuery(
  query: string,
  options?: { ssr?: boolean; fallback?: boolean }
) {
  const { ssr = true, fallback = false } = options || {}
  
  const getMatches = (query: string): boolean => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return fallback
  }

  const [matches, setMatches] = React.useState<boolean>(() => {
    if (ssr) {
      return fallback
    }
    return getMatches(query)
  })

  React.useEffect(() => {
    if (ssr) {
      setMatches(getMatches(query))
    }

    const matchMedia = window.matchMedia(query)
    const handleChange = () => {
      setMatches(getMatches(query))
    }

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query, ssr, fallback])

  return matches
}
