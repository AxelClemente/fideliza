import { PlacesCarousel } from './places-carousel'

interface Place {
  id: string
  location: string
  phoneNumber: string
  name: string
}

interface RestaurantPlacesProps {
  places: Place[]
}

export function RestaurantPlaces({ places }: RestaurantPlacesProps) {
  return (
    <div className="mb-12">
      <h2 className="!text-[30px] font-bold mb-8">
        Places ({places.length})
      </h2>
      <PlacesCarousel places={places} />
    </div>
  )
}