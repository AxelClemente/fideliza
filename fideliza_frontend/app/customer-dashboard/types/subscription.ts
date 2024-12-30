export interface Place {
    id: string
    name: string
    location: string
    phoneNumber: string
  }
  
  export interface Subscription {
    id: string
    name: string
    benefits: string
    price: number
    website?: string
    places: Place[]
  }