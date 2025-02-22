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
      <DialogContent className="
        max-w-[706px] 
        p-0 
        md:!fixed 
        md:!left-auto 
        md:!right-[calc((100vw-1440px)/2)] 
        md:!bottom-0 
        md:!top-0 
        md:!translate-x-0 
        md:!translate-y-0 
        md:!rounded-none 
        md:!h-screen 
        max-md:!fixed 
        max-md:!inset-0 
        max-md:!w-[100vw] 
        max-md:!max-w-[100vw] 
        max-md:!h-[100dvh]
        max-md:!m-0 
        max-md:!p-0 
        max-md:!rounded-none 
        max-md:!translate-x-0 
        max-md:!translate-y-0
      ">
        <div className="h-[100dvh] bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <DialogHeader className="p-4 pb-6">
              <DialogTitle className="
                !text-[26px] 
                font-bold 
                leading-[30px]
                md:pl-8
              ">
                Search filters
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4 pb-[200px]">
              {/* Category */}
              <div className="space-y-2">
                <label className="block text-[16px] font-bold pl-8">
                  Category of business
                </label>
                <Select value={filters.category} onValueChange={value => setFilters({ ...filters, category: value })}>
                  <SelectTrigger className="
                    bg-[#F6F6F6] 
                    h-[78px] 
                    w-[390px] 
                    rounded-[100px] 
                    border-0 
                    mx-auto 
                    md:mx-8 
                    text-third-gray 
                    pl-8 
                    pr-8
                    md:w-[598px]
                  ">
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
                  <SelectTrigger className="
                    bg-[#F6F6F6] 
                    h-[78px] 
                    w-[390px] 
                    rounded-[100px] 
                    border-0 
                    mx-auto 
                    md:mx-8 
                    text-third-gray 
                    pl-8 
                    pr-8
                    md:w-[598px]
                  ">
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

              {/* Has Special offers */}
              <div className="space-y-2">
                <label className="block text-[16px] font-bold pl-8">
                  Has special offers
                </label>
                <Select value={filters.hasOffers} onValueChange={value => setFilters({ ...filters, hasOffers: value })}>
                  <SelectTrigger className="
                    bg-[#F6F6F6] 
                    h-[78px] 
                    w-[390px] 
                    rounded-[100px] 
                    border-0 
                    mx-auto 
                    md:mx-8 
                    text-third-gray 
                    pl-8 
                    pr-8
                    md:w-[598px]
                  ">
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

          {/* Botones fijos */}
          <div className="
            max-md:fixed 
            max-md:bottom-0 
            max-md:left-0 
            max-md:right-0 
            bg-white 
            p-4 
            space-y-0
            border-t 
            border-gray-100
            z-10
          ">
            <Button 
              onClick={handleSaveFilters}
              className="
                w-[390px] 
                h-[78px] 
                rounded-[100px] 
                mx-auto 
                block 
                bg-black 
                text-white
                text-[18px]
                font-semibold
                leading-[22px]
                font-['Open_Sans']
                md:w-[558px]
              "
            >
              Save filters
            </Button>

            <Button 
              variant="ghost"
              onClick={handleResetFilters}
              className="
                w-[390px] 
                h-[78px] 
                mx-auto 
                block 
                !text-black 
                !text-[18px] 
                !font-semibold 
                !leading-[22px] 
                !font-['Open_Sans'] 
                !underline 
                !decoration-solid 
                hover:bg-transparent 
                hover:!text-black/80
              "
            >
              Reset filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}