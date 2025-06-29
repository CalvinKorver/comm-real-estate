'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, User, Plus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Property, Owner } from '@/types/property'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PropertyEditModalProps {
  property: Property
  onPropertyUpdated?: (updatedProperty: Property) => void
}

const propertySchema = z.object({
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  zip_code: z.coerce.number().min(10000, 'Valid zip code is required').max(99999, 'Valid zip code is required'),
  net_operating_income: z.coerce.number().min(0, 'Net operating income must be positive'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  return_on_investment: z.coerce.number().min(0, 'Return on investment must be positive'),
  number_of_units: z.coerce.number().min(1, 'Number of units must be at least 1'),
  square_feet: z.coerce.number().min(1, 'Square feet must be positive'),
})

type PropertyFormData = z.infer<typeof propertySchema>

export function PropertyEditModal({ property, onPropertyUpdated }: PropertyEditModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableOwners, setAvailableOwners] = useState<Owner[]>([])
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>(property.owners?.map(owner => owner.id) || [])

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      street_address: property.street_address,
      city: property.city,
      zip_code: property.zip_code,
      net_operating_income: property.net_operating_income,
      price: property.price,
      return_on_investment: property.return_on_investment,
      number_of_units: property.number_of_units,
      square_feet: property.square_feet,
    },
  })

  // Load available owners and set current owners
  useEffect(() => {
    if (open) {
      loadAvailableOwners()
      setSelectedOwnerIds(property.owners?.map(owner => owner.id) || [])
    }
  }, [open, property.owners])

  const loadAvailableOwners = async () => {
    try {
      const response = await fetch('/api/owners')
      if (response.ok) {
        const data = await response.json()
        setAvailableOwners(data.owners || data)
      }
    } catch (error) {
      console.error('Error loading owners:', error)
    }
  }

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/properties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: property.id,
          ...data,
          owners: selectedOwnerIds, // Send selected owner IDs
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update property')
      }

      const updatedProperty = await response.json()
      onPropertyUpdated?.(updatedProperty)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error updating property:', error)
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const addOwner = (ownerId: string) => {
    if (!selectedOwnerIds.includes(ownerId)) {
      setSelectedOwnerIds([...selectedOwnerIds, ownerId])
    }
  }

  const removeOwner = (ownerId: string) => {
    setSelectedOwnerIds(selectedOwnerIds.filter(id => id !== ownerId))
  }

  const getCurrentOwners = () => {
    return availableOwners.filter(owner => selectedOwnerIds.includes(owner.id))
  }

  const getAvailableOwnersForSelection = () => {
    return availableOwners.filter(owner => !selectedOwnerIds.includes(owner.id))
  }

  // Only allow closing via X button
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) return // ignore all attempts to close except via X
    setOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" hideClose={false}>
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>
        
        {/* Property Info Display */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Street Address</div>
            <div className="font-medium">{property.street_address}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">City</div>
            <div className="font-medium">{property.city}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Zip Code</div>
            <div className="font-medium">{property.zip_code}</div>
          </div>
        </div>

        {/* Owners Management Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            Property Owners
          </h3>
          
          {/* Current Owners */}
          <div className="mb-4">
            <Label className="text-sm font-medium">Current Owners</Label>
            <div className="mt-2 space-y-2">
              {property.owners && property.owners.length > 0 ? (
                property.owners.map((owner) => (
                  <div key={owner.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{owner.firstName} {owner.lastName}</p>
                      {owner.phoneNumber && (
                        <p className="text-sm text-muted-foreground">{owner.phoneNumber}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOwner(owner.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-4">No owners assigned</div>
              )}
            </div>
          </div>

          {/* Add Owner */}
          <div className="mb-4">
            <Label className="text-sm font-medium">Add Owner</Label>
            <div className="mt-2 flex gap-2">
              <Select onValueChange={addOwner}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an owner to add" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOwnersForSelection().map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.firstName} {owner.lastName}
                      {owner.phoneNumber && ` (${owner.phoneNumber})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/owners', '_blank')}
                className="whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Owner
              </Button>
            </div>
          </div>
        </div>

        {/* Property Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="number_of_units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Units</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Property'}
              </Button>
            </div>
          </form>
        </Form>

        {/* Notes Section */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Notes</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Date</TableHead>
                  <TableHead>Content</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {property.notes && property.notes.length > 0 ? (
                  property.notes.map(note => (
                    <TableRow key={note.id}>
                      <TableCell className="text-muted-foreground">
                        {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                      </TableCell>
                      <TableCell>{note.content}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">No notes found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 