import React, { forwardRef, useState, useEffect, useRef } from 'react'
import type { Property } from '@/types/property'
import { Ellipsis, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PropertyListItemProps {
  property: Property
  selected: boolean
  onClick?: () => void
}

const mockPhones = [
  { number: '(425) 298-4505', status: 'success', note: 'Primary' },
  { number: '(206) 228-1109', status: 'unknown', note: 'Son-in-law (never reached)' },
]

const statusIcon = (status: string) => {
  if (status === 'success') {
    return <span title="Verified" className="text-green-600">✔️</span>
  }
  if (status === 'fail') {
    return <span title="Invalid" className="text-red-600">❌</span>
  }
  return <span title="Unknown" className="text-yellow-500">❓</span>
}

const PropertyListItem = forwardRef<HTMLDivElement, PropertyListItemProps>(({ property, selected, onClick }, ref) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // Get up to 2 phone contacts from the first owner
  const phoneContacts = property.owners?.[0]?.contacts?.filter(c => c.phone).slice(0, 2) || [];

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`p-3 border rounded-lg transition-all duration-200 relative ${
        selected
          ? 'border-emerald-500 bg-emerald-50 shadow-md min-h-[360px] cursor-default'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer'
      }`}
    >
      <Button
        className="absolute top-4 right-4 z-10 p-1 rounded cursor-pointer"
        type="button"
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
        aria-label="Show actions"
        ref={buttonRef}
      >
        <Ellipsis size={16} />
      </Button>
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-4 top-10 bg-white border rounded-md shadow-lg z-20 min-w-[40px] flex flex-col items-center"
          onClick={e => e.stopPropagation()}>
          <button className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full h-full text-sm" type="button">
            <Pencil size={16} /> Edit
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">
            {property.street_address}
          </h3>
          <p className="text-sm text-muted-foreground mt-[-6px] mb-1">
            {property.city}, {property.zip_code}
          </p>
          <p className="text-sm text-foreground font-semibold">
            {property.owners?.[0]?.firstName} {property.owners?.[0]?.lastName}
          </p>
        </div>
      </div>
      {selected && (
        <div className="mt-4">
          <div className="text-md mb-2">
            <span className="text-muted-foreground">KeyAI™ Estimate: </span>
            <span className="text-green-600 font-bold">$750k</span>
          </div>
          <div className="mb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-1">Phone</th>
                  <th className="text-left pb-1"> </th>
                  <th className="text-left pb-1">Notes</th>
                </tr>
              </thead>
              <tbody>
                {phoneContacts.length === 0 ? (
                  <tr><td colSpan={3} className="text-muted-foreground py-2">No phone numbers</td></tr>
                ) : (
                  phoneContacts.map((contact, idx) => (
                    <tr key={contact.id} className="border-b last:border-b-0">
                      <td className="py-1">{contact.phone}</td>
                      <td className="px-2">{statusIcon('unknown')}</td>
                      <td>{contact.type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-s font-semibold mb-1">Notes</p>
          {property.notes && property.notes.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">Latest Note</div>
              <div className="text-sm mb-1">{property.notes[0].content}</div>
              <div className="text-xs text-gray-400">
                {property.notes[0].createdAt ? new Date(property.notes[0].createdAt).toLocaleString() : ''}
              </div>
            </div>
          )}
          {property.notes && property.notes.length === 0 && (
              <div className="text-xs text-muted-foreground mb-1">None</div>
          )}
        </div>
      )}
    </div>
  )
})

PropertyListItem.displayName = 'PropertyListItem'

export default PropertyListItem 