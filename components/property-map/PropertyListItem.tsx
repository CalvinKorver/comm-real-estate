import React, { forwardRef, useState } from 'react'
import type { Property } from '@/types/property'
import { Ellipsis, Edit, User } from 'lucide-react'
import { sortContactsByPriority } from '@/utils/contactSorting'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PropertyEditDialog } from '@/components/property-edit/PropertyEditDialog'

interface PropertyListItemProps {
  property: Property
  selected: boolean
  onClick?: () => void
  onPropertyUpdated?: (updatedProperty: Property) => void
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

// Helper function to format date as "June 12" (for display)
const formatNoteDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  
  return `${month} ${day}`
}

// Helper function to format full date and time for tooltip
const formatFullDateTime = (dateString: string | Date) => {
  const date = new Date(dateString)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'pm' : 'am'
  const formattedHours = hours % 12 || 12
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  
  return `${formattedHours}:${formattedMinutes}${ampm} on ${month} ${day}, ${year}`
}

const PropertyListItem = forwardRef<HTMLDivElement, PropertyListItemProps>(({ property, selected, onClick, onPropertyUpdated }, ref) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Get up to 3 phone contacts from all owners, sorted by priority
  const phoneContacts = sortContactsByPriority(
    property.owners?.flatMap(owner => 
      owner.contacts?.filter(c => c.phone) || []
    ) || []
  ).slice(0, 3);

  // Get up to 2 notes
  const displayNotes = property.notes?.slice(0, 2) || [];

  return (
    <TooltipProvider>
      <div
        ref={ref}
        onClick={(e) => {
          // Don't handle clicks if click is on a button/form element
          if (e.target instanceof HTMLButtonElement || 
              e.target instanceof HTMLInputElement ||
              e.target instanceof HTMLTextAreaElement) {
            return;
          }
          onClick?.();
        }}
        className={`p-3 border rounded-lg transition-all duration-200 relative ${
          selected
            ? 'border-emerald-500 bg-emerald-50 shadow-md min-h-[360px] cursor-default'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer'
        }`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Ellipsis
              className="absolute top-2 right-2 z-10 p-1 rounded cursor-pointer hover:scale-110 transition-all duration-200"
              type="button"
              onClick={e => e.stopPropagation()}
              aria-label="Show actions"
            >
              
            </Ellipsis>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white" align="end" >         
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Property</span>
            </DropdownMenuItem>
           

          </DropdownMenuContent>
        </DropdownMenu>

        <PropertyEditDialog
          property={property}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onPropertyUpdated={onPropertyUpdated}
        />
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1">
              {property.street_address}
            </h3>
            <p className="text-sm text-muted-foreground mt-[-6px] mb-1">
              {property.city}, {property.zip_code}
            </p>
            
            {/* Enhanced Owner Display */}
            <div className="mt-2">
              {property.owners && property.owners.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {property.owners.slice(0, 3).map((owner) => (
                      <div key={owner.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {owner.first_name} {owner.last_name}
                        </span>
                      </div>
                    ))}
                    {property.owners.length > 3 && (
                      <div className="pl-6 text-xs text-muted-foreground">+{property.owners.length - 3} more</div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No owners</p>
              )}
            </div>
          </div>
        </div>
        {selected && (
          <div className="mt-4">
            <div className="text-md mb-2">
              <span className="text-muted-foreground">KeyAI™ Estimate: </span>
              <span className="text-green-600 font-bold">$750k</span>
            </div>
            
            {/* Phone Numbers Table */}
            <div className="mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phoneContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground text-center py-4">
                        No phone numbers
                      </TableCell>
                    </TableRow>
                  ) : (
                    phoneContacts.map((contact, idx) => {
                      // Find the owner for this contact
                      const owner = property.owners?.find(o => 
                        o.contacts?.some(c => c.id === contact.id)
                      );
                      return (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.phone}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {contact.label ? contact.label.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No label'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {contact.notes || 'No notes'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              {property.owners && property.owners.flatMap(owner => owner.contacts?.filter(c => c.phone) || []).length > 3 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ({property.owners.flatMap(owner => owner.contacts?.filter(c => c.phone) || []).length - 3} more)
                </p>
              )}
            </div>

            {/* Notes Table */}
            <div className="mb-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Note</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground text-center py-4">
                        No notes
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayNotes.map((note, idx) => (
                      <TableRow key={note.id}>
                        <TableCell className="">
                          {note.content}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {note.created_at ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  {new Date(note.created_at).toLocaleDateString()}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="">
                                <p>{formatFullDateTime(note.created_at)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {property.notes && property.notes.length > 3 && (
                <p className="text-xs text-muted-foreground mt-1">
                  +{property.notes.length - 3} more notes
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
})

PropertyListItem.displayName = 'PropertyListItem'

export default PropertyListItem 