'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown } from "lucide-react"

interface StatsData {
  value: string
  change: string
  changeType: "positive" | "negative"
  subscribers?: Array<{
    id: string
    name: string
    email: string
    imageUrl?: string
  }>
}

interface AnalyticsDashboardProps {
  featuredOffers?: Array<{
    id: string
    title: string
    images: Array<{
      id: string
      createdAt: Date
      url: string
      publicId: string
      offerId: string
    }>
    placeName: string
  }>
  viewStats: {
    views: StatsData
    earnings: StatsData
    subscriptions: StatsData
    offerViews: Array<{
      offerId: string
      value: string
      change: string
      changeType: "positive" | "negative"
    }>
  }
}

type MetricType = 'views' | 'earnings' | 'subscriptions'

export default function AnalyticsDashboard({ 
  featuredOffers = [],
  viewStats
}: AnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('views')

  // Generar datos del gráfico basados en los valores reales
  const chartData = {
    views: [
      { day: "Mon", value: parseInt(viewStats.views.value) / 7 },
      { day: "Tue", value: parseInt(viewStats.views.value) / 6 },
      { day: "Wed", value: parseInt(viewStats.views.value) / 5 },
      { day: "Thu", value: parseInt(viewStats.views.value) / 4 },
      { day: "Fri", value: parseInt(viewStats.views.value) / 3 },
      { day: "Sat", value: parseInt(viewStats.views.value) / 2 },
      { day: "Sun", value: parseInt(viewStats.views.value) },
    ],
    earnings: [
      { day: "Mon", value: parseFloat(viewStats.earnings.value.replace('€','')) / 7 },
      { day: "Tue", value: parseFloat(viewStats.earnings.value.replace('€','')) / 6 },
      { day: "Wed", value: parseFloat(viewStats.earnings.value.replace('€','')) / 5 },
      { day: "Thu", value: parseFloat(viewStats.earnings.value.replace('€','')) / 4 },
      { day: "Fri", value: parseFloat(viewStats.earnings.value.replace('€','')) / 3 },
      { day: "Sat", value: parseFloat(viewStats.earnings.value.replace('€','')) / 2 },
      { day: "Sun", value: parseFloat(viewStats.earnings.value.replace('€','')) },
    ],
    subscriptions: [
      { day: "Mon", value: parseInt(viewStats.subscriptions.value) / 7 },
      { day: "Tue", value: parseInt(viewStats.subscriptions.value) / 6 },
      { day: "Wed", value: parseInt(viewStats.subscriptions.value) / 5 },
      { day: "Thu", value: parseInt(viewStats.subscriptions.value) / 4 },
      { day: "Fri", value: parseInt(viewStats.subscriptions.value) / 3 },
      { day: "Sat", value: parseInt(viewStats.subscriptions.value) / 2 },
      { day: "Sun", value: parseInt(viewStats.subscriptions.value) },
    ]
  }

  const stats = [
    {
      id: 'views' as MetricType,
      title: "New views",
      ...viewStats.views
    },
    {
      id: 'earnings' as MetricType,
      title: "Earnings",
      ...viewStats.earnings
    },
    {
      id: 'subscriptions' as MetricType,
      title: "New Subs",
      ...viewStats.subscriptions
    }
  ]

  // Actualizar el título según la métrica seleccionada
  const getMetricTitle = () => {
    switch(selectedMetric) {
      case 'views':
        return 'Views'
      case 'earnings':
        return 'Earnings'
      case 'subscriptions':
        return 'Subscriptions'
      default:
        return 'Views'
    }
  }

  const getCurrentValue = () => {
    switch(selectedMetric) {
      case 'views':
        return viewStats.views.value
      case 'earnings':
        return viewStats.earnings.value
      case 'subscriptions':
        return viewStats.subscriptions.value
      default:
        return '0'
    }
  }

  const getPreviousValue = () => {
    // Como acabamos de empezar, todos los valores anteriores son 0
    return selectedMetric === 'earnings' ? '€0.00' : '0'
  }

  return (
    <div className="p-6 space-y-8 bg-white">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-center md:text-left">{getMetricTitle()}</h2>
        <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
          <div className="flex items-center justify-center w-full md:justify-start gap-20 md:gap-4">
            <div className="text-center md:text-left">
              <p className="text-lg md:text-sm text-muted-foreground">Current Week </p>
              <p className="text-2xl font-bold">{getCurrentValue()}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg md:text-sm text-muted-foreground">Previous Week </p>
              <p className="text-2xl font-bold">{getPreviousValue()}</p>
            </div>
          </div>
          <div className="md:ml-auto flex justify-center w-full md:w-auto mt-6 md:mt-0">
            <Select defaultValue="this-week">
              <SelectTrigger className="w-full md:w-[180px] h-[78px] md:h-10 rounded-[100px] md:rounded-md bg-[#F6F6F6] md:bg-white text-[#7B7B7B] flex items-center px-6">
                <div className="flex items-center gap-3">
                  <Image
                    src="/calendar.svg"
                    alt="Calendar"
                    width={24}
                    height={24}
                  />
                  <SelectValue 
                    placeholder="Select period" 
                    className="text-[#7B7B7B]"
                  />
                </div>
                <ChevronDown className="ml-auto h-6 w-6 text-[#7B7B7B] opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This week</SelectItem>
                <SelectItem value="last-week">Last week</SelectItem>
                <SelectItem value="last-month">Last month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="h-[300px] -ml-12 ">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData[selectedMetric]}
            margin={{ left: 10, right: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={80} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#FF0080" 
              dot={{ fill: "#FF0080", r: 4 }}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Versión móvil - Carousel */}
      <div className="block md:hidden py-4">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="gap-4 py-2">
            {stats.map((stat) => (
              <CarouselItem key={stat.title} className="basis-[262px]">
                <Card className="shadow-[0_4px_10px_rgba(0,0,0,0.08)] bg-[#FFFFFE] border-none h-[230px] rounded-[10px]">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-[20px] leading-[26px] font-semibold">{stat.title}</p>
                      <p className="text-[20px] font-bold">{stat.value}</p>
                      <p className={`text-sm ${
                        stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                      }`}>
                        {stat.change}
                      </p>
                      <p className="text-[16px] font-semibold text-muted-foreground">This month</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Versión desktop - Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title}
            className="cursor-pointer relative group w-[262px] h-[230px] rounded-[10px]"
            onClick={() => setSelectedMetric(stat.id)}
          >
            <CardContent className={`p-6 transition-all duration-300 rounded-xl ${
              selectedMetric === stat.id 
                ? 'bg-gray-50 ring-2 ring-primary' 
                : 'hover:bg-gray-50 hover:shadow-md'
            }`}>
              <div className="space-y-2">
                <p className="text-[20px] leading-[26px] font-semibold">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                }`}>
                  {stat.change}
                </p>
                <p className="text-[16px] leading-[20px] font-semibold text-muted-foreground">This month</p>
              </div>

              {/* Popup con información de suscriptores */}
              {stat.id === 'subscriptions' && stat.subscribers && stat.subscribers.length > 0 && (
                <div className="
                  absolute 
                  hidden 
                  group-hover:block 
                  top-full 
                  left-0 
                  mt-2 
                  w-[300px] 
                  bg-white 
                  shadow-lg 
                  rounded-xl 
                  p-4 
                  z-50
                  border
                ">
                  <h3 className="font-semibold mb-2">Recent Subscribers</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {stat.subscribers.map((subscriber, index) => (
                      <div 
                        key={`${subscriber.id}-${index}`}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={subscriber.imageUrl} alt={subscriber.name} />
                          <AvatarFallback>{subscriber.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{subscriber.name}</p>
                          <p className="text-xs text-gray-500 truncate">{subscriber.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Current offers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featuredOffers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-0">
                <div className="flex h-48">
                  {/* Lado izquierdo - Imagen */}
                  <div className="relative w-1/2 overflow-hidden rounded-l-lg">
                    {offer.images[0] && (
                      <Image
                        src={offer.images[0].url}
                        alt={`${offer.title}${offer.placeName ? ` at ${offer.placeName}` : ''}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>

                  {/* Lado derecho - Contenido */}
                  <div className="w-1/2 p-6 flex flex-col justify-center">
                    <p className="text-[20px] leading-[26px] font-semibold">New views</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      {(() => {
                        const stats = viewStats.offerViews.find(
                          stats => stats.offerId === offer.id
                        )
                        return (
                          <>
                            <p className="text-[24px] leading-[32px] font-bold">
                              {stats?.value || "0"}
                            </p>
                            <p className={`text-sm ${
                              stats?.changeType === "positive" 
                                ? "text-green-500" 
                                : "text-red-500"
                            }`}>
                              {stats?.change || "0%"}
                            </p>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
