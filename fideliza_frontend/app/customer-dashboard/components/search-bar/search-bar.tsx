"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useState } from "react"

interface SearchBarProps {
  placeholder: string;
  onSearch: (searchTerm: string) => void;
  onFilterClick: () => void;
}

export function SearchBar({ placeholder, onSearch, onFilterClick }: SearchBarProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }

  return (
    <div className="w-full lg:w-[1392px] h-[78px] relative">
      <div className="rounded-[100px] bg-[#F6F6F6] p-6 flex items-center justify-between">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Image
              src="/lupa.svg"
              alt="Search icon"
              width={18}
              height={18}
              className="text-gray-500"
            />
          </div>
          <Input
            id="search"
            type="text"
            placeholder={placeholder}
            onChange={handleInputChange}
            className="pl-12 h-[46px] !ring-0 !ring-offset-0 border-0 shadow-none bg-transparent focus:!ring-0 focus:!ring-offset-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 !outline-none !font-['Open_Sans'] !font-semibold !text-[18px] !leading-[22px] !placeholder:text-[#7B7B7B]"
          />
        </div>
        <div 
          className="absolute right-6 lg:right-8 top-[55%] -translate-y-1/2 cursor-pointer"
          onClick={onFilterClick}
        >
          <Image
            src="/filter.svg"
            alt="Filter icon"
            width={30}
            height={30}
          />
        </div>
      </div>
    </div>
  )
}