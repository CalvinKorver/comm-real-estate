import { SearchHeader } from "@/components/search-header"

// Backward compatibility - SiteHeader now uses SearchHeader
export function SiteHeader() {
  return <SearchHeader />
}