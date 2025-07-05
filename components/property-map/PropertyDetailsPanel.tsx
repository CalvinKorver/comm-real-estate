import { useState } from 'react'
import type { Property } from '@/types/property'
import { PANEL_WIDTHS } from '@/lib/map-constants'
import { sortContactsByPriority } from '@/utils/contactSorting'

interface PropertyDetailsPanelProps {
  property: Property
  onBack: () => void
  className?: string
}

export default function PropertyDetailsPanel({
  property,
  onBack,
  className = ""
}: PropertyDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'owner' | 'location'>('overview')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'financial', label: 'Financial' },
    { id: 'owner', label: 'Owner' },
    { id: 'location', label: 'Location' },
  ] as const

  return (
    <aside
      className={`${PANEL_WIDTHS.LIST_PANEL.DEFAULT} ${PANEL_WIDTHS.LIST_PANEL.MIN} ${PANEL_WIDTHS.LIST_PANEL.MAX} h-full border-r bg-white shadow-lg flex flex-col overflow-y-auto ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Back to property list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-foreground">Property Details</h2>
        </div>
        
        <div>
          <h3 className="font-medium text-foreground mb-1">
            {property.street_address}
          </h3>
          <p className="text-sm text-muted-foreground">
            {property.city}, {property.state} {property.zip_code}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white sticky top-[120px] z-10">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Property Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Units</p>
                    <p className="font-medium">{property.number_of_units}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Square Feet</p>
                    <p className="font-medium">{formatNumber(property.square_feet)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">{formatCurrency(property.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="font-medium">{property.return_on_investment}%</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {property.notes && property.notes.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Notes</h4>
                  <div className="space-y-2">
                    {property.notes.slice(0, 2).map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{note.content}</p>
                        <div className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {property.notes.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{property.notes.length - 2} more notes
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No notes yet
                </div>
              )}

              {/* Contacts Section */}
              {property.owners && property.owners.some(owner => owner.contacts && owner.contacts.length > 0) && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Contacts</h4>
                  <div className="space-y-2">
                    {sortContactsByPriority(
                      property.owners
                        .flatMap(owner => owner.contacts || [])
                    )
                      .slice(0, 3)
                      .map((contact) => (
                        <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                          {contact.phone && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Phone:</span> {contact.phone}
                            </p>
                          )}
                          {contact.email && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Email:</span> {contact.email}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {contact.type} • Priority: {contact.priority}
                          </p>
                        </div>
                      ))}
                    {property.owners.flatMap(owner => owner.contacts || []).length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        ({property.owners.flatMap(owner => owner.contacts || []).length - 3} more)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {property.parcel_id && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Legal Information</h4>
                  <div>
                    <p className="text-sm text-muted-foreground">Parcel ID</p>
                    <p className="font-medium">{property.parcel_id}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Financial Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold text-lg">{formatCurrency(property.price)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Operating Income</p>
                      <p className="font-semibold text-lg">{formatCurrency(property.net_operating_income)}/year</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Return on Investment</p>
                      <p className="font-semibold text-lg text-emerald-600">{property.return_on_investment}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Per Unit Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Unit</p>
                    <p className="font-medium">{formatCurrency(property.price / property.number_of_units)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NOI per Unit</p>
                    <p className="font-medium">{formatCurrency(property.net_operating_income / property.number_of_units)}/year</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Sq Ft</p>
                    <p className="font-medium">{formatCurrency(property.price / property.square_feet)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NOI per Sq Ft</p>
                    <p className="font-medium">{formatCurrency(property.net_operating_income / property.square_feet)}/year</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'owner' && (
            <div className="space-y-6">
              {property.owners && property.owners.length > 0 ? (
                property.owners.map((owner, index) => (
                  <div key={owner.id} className="space-y-4">
                    <h4 className="font-semibold text-foreground">
                      {property.owners!.length > 1 ? `Owner ${index + 1}` : 'Owner'}
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{owner.first_name} {owner.last_name}</p>
                      </div>

                      {owner.llc_contact && (
                        <div>
                          <p className="text-sm text-muted-foreground">LLC Contact</p>
                          <p className="font-medium">{owner.llc_contact}</p>
                        </div>
                      )}

                      {owner.street_address && (
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {owner.street_address}
                            {owner.city && `, ${owner.city}`}
                            {owner.state && `, ${owner.state}`}
                            {owner.zip_code && ` ${owner.zip_code}`}
                          </p>
                        </div>
                      )}

                      {owner.phone_number && (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">{owner.phone_number}</p>
                        </div>
                      )}

                      {owner.contacts && owner.contacts.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Additional Contacts</p>
                          <div className="space-y-2">
                            {sortContactsByPriority(owner.contacts).map((contact) => (
                              <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                                {contact.phone && (
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Phone:</span> {contact.phone}
                                  </p>
                                )}
                                {contact.email && (
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Email:</span> {contact.email}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {contact.type} • Priority: {contact.priority}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No owner information available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Address Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Street Address</p>
                    <p className="font-medium">{property.street_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{property.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{property.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ZIP Code</p>
                    <p className="font-medium">{property.zip_code}</p>
                  </div>
                </div>
              </div>

              {property.coordinates && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Coordinates</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Latitude</p>
                      <p className="font-medium">{property.coordinates.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Longitude</p>
                      <p className="font-medium">{property.coordinates.longitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="font-medium capitalize">{property.coordinates.confidence}</p>
                    </div>
                    {property.coordinates.place_id && (
                      <div>
                        <p className="text-sm text-muted-foreground">Place ID</p>
                        <p className="font-medium">{property.coordinates.place_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
} 