export interface RestaurantImage {
    id: string
    url: string
    publicId: string
    restaurantId: string
    createdAt: Date
  }
  
  export interface Restaurant {
    id: string
    title: string
    description: string
    website?: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
    images: RestaurantImage[]
    places: Place[]
    subscriptions?: Subscription[]
    offers?: Offer[]
  }
  
  export interface Place {
    id: string
    name: string
    location: string
    phoneNumber?: string | null
    restaurantId: string
    createdAt?: Date
    updatedAt?: Date
  }
  
  export interface Offer {
    id: string
    title: string
    description: string
    startDate: Date
    finishDate: Date
    website?: string | null
    placeId: string
    createdAt?: Date
    updatedAt?: Date
    images: {
      id: string
      url: string
      publicId: string
      offerId: string
    }[] | []
  }
  
  export interface Subscription {
    id: string
    name: string
    benefits: string
    price: number
    website?: string | null
    visitsPerMonth?: number | null
    period: 'MONTHLY' | 'ANNUAL'
    unlimitedVisits?: boolean
    createdAt?: Date
    updatedAt?: Date
    places: { id: string; name: string }[]
  }
  
  export interface ExtendedSubscription extends Subscription {
    placeName: string
  }
  
  export interface Mailing {
    id: string
    name: string
    description: string
    startDate: Date
    endDate: Date
    time: string
    subscriptionStatus: string
    lastVisit: string
    location: string
    createdAt: Date
    updatedAt: Date
  }

  export interface ProviderSubscription {
    id: string
    name: string
    benefits: string
    price: number
    website?: string | null
    visitsPerMonth?: number | null
    period: 'MONTHLY' | 'ANNUAL'
    unlimitedVisits?: boolean
    createdAt?: Date
    updatedAt?: Date
  }