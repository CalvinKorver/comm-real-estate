import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { useSearch } from "@/contexts/SearchContext"
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function SearchHeader() {
  const { search, onSearchChange, onSearchSubmit, isSearchEnabled } = useSearch()
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const router = useRouter()

  const handleSignOut = () => {
    router.push('/auth/signout')
  }

  return (
    <header className="bg-background sticky top-0 z-40 w-full">
      <div className="w-full px-4 flex h-18 items-center pt-2">
        {/* Left section - Navigation */}
        <div className="flex gap-6 md:gap-10">
          <Link href="/properties" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="inline-block font-bold">{siteConfig.name}</span>
          </Link>
          {siteConfig.mainNav?.length ? (
            <nav className="flex gap-6">
              {siteConfig.mainNav?.map(
                (item, index) =>
                  item.href && (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center text-sm font-medium text-muted-foreground"
                    >
                      {item.title}
                    </Link>
                  )
              )}
            </nav>
          ) : null}
        </div>

        {/* Center section - Search */}
        {isSearchEnabled && (
          <div className="flex-1 flex justify-center px-4">
            <form onSubmit={onSearchSubmit} className="flex max-w-md w-full">
              <input
                type="text"
                value={search}
                onChange={onSearchChange}
                placeholder="Search (for owners, addresses, etc)"
                className="flex-1 px-3 py-1.5 border border-input rounded-l-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
                style={{ minWidth: 0 }}
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 flex items-center justify-center"
                aria-label="Search"
              >
                <Icons.searchIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Right section - User controls */}
        <div className="flex items-center space-x-4">
          {session && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <Icons.logout className="h-4 w-4" />
            </Button>
          )}
          <Button 
            className="h-8 w-24 bg-green-600 rounded-full hover:bg-green-700 text-white text-muted-foreground hover:text-foreground"
            variant="ghost"
            size="icon"
            title="upload-csv"
            onClick={() => router.push('/csv-upload')}>
            <span className="text-white">Upload</span>
          </Button>
          
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : (
            <UserNav />
          )}
        </div>
      </div>
    </header>
  )
} 