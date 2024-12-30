// app/customer-dashboard/components/search-section.tsx
import { SearchBar } from "./search-bar"

interface SearchSectionProps {
  onSearch: (searchTerm: string) => void
  onFilterClick: () => void
}

export function SearchSection({ onSearch, onFilterClick }: SearchSectionProps) {
  return (
    <div className="flex justify-center">
      <SearchBar 
        placeholder="Search restaurants..." 
        onSearch={onSearch}
        onFilterClick={onFilterClick}
      />
    </div>
  )
}