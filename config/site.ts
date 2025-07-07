import { NavItem } from "@/types/nav"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Keystone",
  description: "Commercial Real Estate Investment Management",

  mainNav: [
    {
      title: "Properties",
      href: "/properties",
    },
    {
      title: "Map",
      href: "/properties/map",
    },
  ] as NavItem[],
}
