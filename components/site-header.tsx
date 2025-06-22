import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full">
      <div className="w-full px-4 flex h-24 items-center">
        <MainNav items={siteConfig.mainNav} />
      </div>
    </header>
  )
}