import React, { forwardRef, useState } from 'react'
import type { Property } from '@/types/property'
import { Ellipsis, Edit } from 'lucide-react'
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
import { PropertyEditDialog } from '@/components/PropertyEditDialog'

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

  // Get up to 2 phone contacts from all owners
  const phoneContacts = property.owners?.flatMap(owner => 
    owner.contacts?.filter(c => c.phone).slice(0, 2) || []
  ).slice(0, 4) || [];

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
            <Button
              className="absolute top-4 right-4 z-10 p-1 rounded cursor-pointer"
              type="button"
              onClick={e => e.stopPropagation()}
              aria-label="Show actions"
            >
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white" align="end" >
            <DropdownMenuLabel>Property Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
         
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
                  {property.owners.length === 1 ? (
                    <p className="text-sm text-foreground font-semibold">
                      {property.owners[0].firstName} {property.owners[0].lastName}
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground font-semibold">
                        {property.owners.length} Owners
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {property.owners.slice(0, 2).map((owner, idx) => (
                          <div key={owner.id}>
                            {owner.firstName} {owner.lastName}
                            {idx === 0 && property.owners && property.owners.length > 2 && ' + more...'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
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
                            {owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}
                          </TableCell>
                          <TableCell>{contact.type}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
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
                  {property.notes && property.notes.length > 0 ? (
                    property.notes.map((note, idx) => (
                      <TableRow key={note.id}>
                        <TableCell className="font-medium">
                          {note.content}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {note.createdAt ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  {formatNoteDate(note.createdAt)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white text-black">
                                <p>{formatFullDateTime(note.createdAt)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground text-center py-4">
                        No notes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
})

PropertyListItem.displayName = 'PropertyListItem'

export default PropertyListItem 