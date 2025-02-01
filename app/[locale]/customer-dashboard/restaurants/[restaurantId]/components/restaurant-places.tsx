import { PlacesCarousel } from './places-carousel'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('CustomerDashboard.restaurant')

  return (
    <div className="mb-12">
      <h2 className="!text-[30px] font-bold mb-8">
        {t('places', { count: places.length })}
      </h2>
      <PlacesCarousel places={places} />
    </div>
  )
}