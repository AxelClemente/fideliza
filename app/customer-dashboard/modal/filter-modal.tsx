'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onFilter: (filters: FilterValues) => void
}

interface FilterValues {
  category: string
  subcategory: string
  hasSubscriptions: string
  hasOffers: string
}

export function FilterModal({ isOpen, onClose, onFilter }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterValues>({
    category: '',
    subcategory: '',
    hasSubscriptions: '',
    hasOffers: ''
  })

  console.log('FilterModal props:', { isOpen, onClose, onFilter })

  const handleSaveFilters = () => {
    if (typeof onFilter !== 'function') {
      console.error('onFilter is not a function')
      return
    }

    try {
      onFilter(filters)
      onClose()
    } catch (error) {
      console.error('Error calling onFilter:', error)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      hasSubscriptions: '',
      hasOffers: ''
    })

    if (typeof onFilter === 'function') {
      onFilter({
        category: '',
        subcategory: '',
        hasSubscriptions: '',
        hasOffers: ''
      })
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[706px] p-0 overflow-hidden !fixed !left-0 !right-0 !bottom-0 !top-0 !translate-x-0 !translate-y-0 !rounded-none !h-screen md:!left-auto md:!right-[calc((100vw-1440px)/2)] flex flex-col">
        <DialogHeader className="p-3 md:p-4 pb-0 flex-shrink-0">
          <DialogTitle className="!text-[30px] md:!text-[30px] !font-bold !leading-[34px] md:!leading-[34px] !font-['Open_Sans'] text-center md:text-left px-4 md:px-8 mt-10 w-full">
            Search filters
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pb-[160px] md:pb-4">
          <div className="p-3 md:p-4 space-y-4 px-4 md:px-8">
            {/* Category */}
            <div className="space-y-2">
              <label className="block text-[16px] font-bold pl-8">
                Category of business
              </label>
              <Select value={filters.category} onValueChange={value => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="bg-[#F6F6F6] h-[78px] w-[390px] md:w-[598px] rounded-[100px] border-0 mx-auto md:mx-0 text-third-gray pl-8 pr-8">
                  <SelectValue placeholder="Select category" />
                  <ChevronDown className="h-6 w-6 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="buffet">Buffet</SelectItem>
                  <SelectItem value="cafe">Café & Bakery</SelectItem>
                  <SelectItem value="deli">Deli & Sandwiches</SelectItem>
                  <SelectItem value="fastfood">Fast Food</SelectItem>
                  <SelectItem value="foodtruck">Food Truck</SelectItem>
                  <SelectItem value="icecream">Ice Cream & Desserts</SelectItem>
                  <SelectItem value="pizzeria">Pizzeria</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="seafood">Seafood Restaurant</SelectItem>
                  <SelectItem value="sushi">Sushi Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div className="space-y-2">
              <label className="block text-[16px] font-bold pl-8">
                Subcategory of business
              </label>
              <Select value={filters.subcategory} onValueChange={value => setFilters({ ...filters, subcategory: value })}>
                <SelectTrigger className="bg-[#F6F6F6] h-[78px] w-[390px] md:w-[598px] rounded-[100px] border-0 mx-auto md:mx-0 text-third-gray pl-8 pr-8">
                  <SelectValue placeholder="Select subcategory" />
                  <ChevronDown className="h-6 w-6 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="bbq">BBQ & Grill</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="thai">Thai</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian & Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Subscriptions */}
            <div className="space-y-2">
              <label className="block text-[16px] font-bold pl-8">
                Has subscriptions
              </label>
              <Select value={filters.hasSubscriptions} onValueChange={value => setFilters({ ...filters, hasSubscriptions: value })}>
                <SelectTrigger className="bg-[#F6F6F6] h-[78px] w-[390px] md:w-[598px] rounded-[100px] border-0 mx-auto md:mx-0 text-third-gray pl-8 pr-8">
                  <SelectValue placeholder="Select option" />
                  <ChevronDown className="h-6 w-6 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Special offers */}
            <div className="space-y-2">
              <label className="block text-[16px] font-bold pl-8">
                Has special offers
              </label>
              <Select value={filters.hasOffers} onValueChange={value => setFilters({ ...filters, hasOffers: value })}>
                <SelectTrigger className="bg-[#F6F6F6] h-[78px] w-[390px] md:w-[598px] rounded-[100px] border-0 mx-auto md:mx-0 text-third-gray pl-8 pr-8">
                  <SelectValue placeholder="Select option" />
                  <ChevronDown className="h-6 w-6 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-3 md:p-4 px-8 md:px-14 space-y-2 md:space-y-3 flex-shrink-0 bg-white fixed bottom-0 left-0 right-0 md:relative">
          <Button 
            onClick={handleSaveFilters} 
            className="w-[390px] md:w-[580px] h-[78px] rounded-[100px] mx-auto md:mx-0 bg-black text-[16px] font-semibold leading-[20px] font-['Open_Sans']"
          >
            Save filters
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleResetFilters}
            className="w-[390px] md:w-full h-[50px] md:h-[60px] mx-auto md:mx-0 !p-0 !text-black !text-[16px] md:!text-[18px] !font-semibold !leading-[20px] md:!leading-[22px] !font-['Open_Sans'] !underline !decoration-solid hover:bg-transparent hover:!text-black/80"
          >
            Reset filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}