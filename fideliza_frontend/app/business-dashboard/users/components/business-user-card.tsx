"use client"

interface BusinessUserCardProps {
  name: string
  restaurants: {
    title: string
    places: {
      name: string
    }[]
  }[]
  imageUrl: string
}

export function BusinessUserCard({ name, restaurants, imageUrl }: BusinessUserCardProps) {
  const allPlaces = restaurants.flatMap(restaurant => 
    restaurant.places.map(place => place.name)
  )

  return (
    <div className="flex items-center justify-between rounded-[20px] border bg-white w-[390px] sm:w-[476px] h-[84px] overflow-hidden ml-4 sm:ml-0">
      <div className="flex items-center h-full">
        <div className="h-full w-[90px] sm:w-[106px] relative">
          <img 
            src={imageUrl} 
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="px-4">
          <p className="font-medium text-base">{name}</p>
          <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
            {allPlaces.join(", ")}
          </p>
        </div>
      </div>
    </div>
  )
}