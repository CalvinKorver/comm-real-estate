'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Property } from '@/types/property'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>
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