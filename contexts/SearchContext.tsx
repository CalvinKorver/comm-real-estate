"use client"

import React, { createContext, ReactNode, useContext, useState } from "react"

interface SearchContextType {
  search: string
  setSearch: (search: string) => void
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearchSubmit: (e: React.FormEvent) => void
  setOnSearchSubmit: (handler: (e: React.FormEvent) => void) => void
  isSearchEnabled: boolean
  setIsSearchEnabled: (enabled: boolean) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [search, setSearch] = useState("")
  const [isSearchEnabled, setIsSearchEnabled] = useState(false)
  const [onSearchSubmit, setOnSearchSubmitState] = useState<
    (e: React.FormEvent) => void
  >(() => (e: React.FormEvent) => {
    e.preventDefault()
    // Default no-op handler
  })

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const setOnSearchSubmit = (handler: (e: React.FormEvent) => void) => {
    setOnSearchSubmitState(() => handler)
  }

  return (
    <SearchContext.Provider
      value={{
        search,
        setSearch,
        onSearchChange,
        onSearchSubmit,
        setOnSearchSubmit,
        isSearchEnabled,
        setIsSearchEnabled,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
