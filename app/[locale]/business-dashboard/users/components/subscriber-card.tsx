'use client'

import { FileText, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useSubscribers } from "../../context/subscribers-context"
import { useTranslations } from "use-intl"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from 'date-fns'

interface ValidationHistory {
  id: string
  validationDate: string
  subscriptionName: string
  placeName: string
  remainingVisits: number | null
  startDate: string | null
  endDate: string | null
}

interface GroupedValidations {
  [subscriptionName: string]: {
    validations: ValidationHistory[];
    placeName: string;
    startDate: string | null;
    endDate: string | null;
  }
}

export function SubscriberCard() {
  const { subscribers } = useSubscribers()
  const t = useTranslations('BusinessDashboard')
  const [selectedSubscriber, setSelectedSubscriber] = useState<string | null>(null)
  const [validations, setValidations] = useState<ValidationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSubscribers, setExpandedSubscribers] = useState<Record<string, boolean>>({})
  
  // Eliminar duplicados basados en el ID del suscriptor
  const uniqueSubscribers = Array.from(
    new Map(subscribers.map(sub => [sub.id, sub])).values()
  )
  
  const handleDelete = async (subscriberId: string, subscriptionId: string) => {
    try {
      // Verificar condiciones
      const subscriber = uniqueSubscribers.find(sub => sub.id === subscriberId)
      console.log('Subscriber found:', subscriber)
      
      if (!subscriber || subscriber.subscription.status === 'ACTIVE' || new Date(subscriber.subscription.endDate) > new Date()) {
        console.log('Cannot delete active or non-expired subscription')
        toast.error(t('cannotDeleteActiveSubscription'))
        return
      }

      console.log('Sending PATCH request for subscriptionId:', subscriptionId)

      // Realizar la solicitud PATCH
      const response = await fetch(`/api/user-subscriptions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userSubscriptionId: subscriptionId }),
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        toast.success(t('subscriptionDeleted'))
        // Aquí podrías actualizar el estado local o volver a cargar los datos
      } else {
        toast.error(t('errorDeletingSubscription'))
      }
    } catch (error) {
      console.error('Error deleting subscription:', error)
      toast.error(t('errorDeletingSubscription'))
    }
  }

  const handleViewHistory = async (subscriberId: string) => {
    try {
      setIsLoading(true)
      setSelectedSubscriber(subscriberId)
      
      console.log('Fetching history for subscriber:', subscriberId)
      
      const response = await fetch(`/api/validate-subscription/save-validation?subscriberId=${subscriberId}`)
      const data = await response.json()
      
      console.log('History response:', data)

      if (response.ok && data.validations) {
        setValidations(data.validations)
      } else {
        toast.error(t('errorFetchingHistory'))
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error(t('errorFetchingHistory'))
    } finally {
      setIsLoading(false)
    }
  }

  const groupValidationsBySubscription = (validations: ValidationHistory[]): GroupedValidations => {
    return validations.reduce((groups, validation) => {
      const key = validation.subscriptionName;
      if (!groups[key]) {
        groups[key] = {
          validations: [],
          placeName: validation.placeName,
          startDate: validation.startDate,
          endDate: validation.endDate
        };
      }
      groups[key].validations.push(validation);
      return groups;
    }, {} as GroupedValidations);
  };

  const toggleSubscriberExpand = (subscriberId: string) => {
    setExpandedSubscribers(prev => ({
      ...prev,
      [subscriberId]: !prev[subscriberId]
    }));
  };

  return (
    <div className="space-y-5">
      {uniqueSubscribers.length > 0 ? (
        uniqueSubscribers.map((subscriber) => (
          <div 
            key={subscriber.id} 
            className="rounded-[20px] border bg-white w-[390px] sm:w-[476px] overflow-hidden ml-4 sm:ml-0"
          >
            <div className="flex items-center justify-between h-[84px]">
              <div className="flex items-center h-full">
                <div className="h-full w-[90px] sm:w-[106px] relative">
                  <img 
                    src={subscriber.imageUrl || '/images/placeholder.png'}
                    alt={subscriber.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-4">
                  <p className="font-medium text-base">{subscriber.name}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-[250px]">
                    {subscriber.email}
                  </p>
                  
                  {/* Reemplazar la visualización de la primera suscripción con un título */}
                  {subscriber.subscriptions && subscriber.subscriptions.length > 0 && (
                    <button 
                      onClick={() => toggleSubscriberExpand(subscriber.id)}
                      className="text-xs font-bold flex items-center mt-1 hover:text-blue-500 transition-colors"
                    >
                      {t('subscriptions')}
                      {expandedSubscribers[subscriber.id] ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 pr-4">
                <button 
                  className="text-black hover:text-blue-600 transition-colors p-2"
                  onClick={() => handleViewHistory(subscriber.id)}
                >
                  <FileText className="h-5 w-5" />
                </button>
                <button 
                  className="text-black hover:text-destructive transition-colors p-2"
                  onClick={() => handleDelete(subscriber.id, subscriber.subscription.id)}
                >
                   <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Sección expandible para mostrar todas las suscripciones */}
            {subscriber.subscriptions && 
             subscriber.subscriptions.length > 0 && 
             expandedSubscribers[subscriber.id] && (
              <div className="px-4 pb-4 border-t pt-3">
                <div className="space-y-2">
                  {subscriber.subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold">{sub.name || sub.type}</span>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(subscriber.id, sub.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-gray-600 mt-1">
                        {new Date(sub.startDate).toLocaleDateString()} → {new Date(sub.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600 mt-1">
                        {t('status')}: <span className={`font-medium ${sub.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'}`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="!text-[20px] text-muted-foreground hover:no-underline !font-[700] pt-3 pl-4">
          {t('noSubscribers')}
        </div>
      )}

      <Dialog open={!!selectedSubscriber} onOpenChange={() => setSelectedSubscriber(null)}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              {t('validationHistory')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">{t('loading')}</span>
              </div>
            ) : validations.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupValidationsBySubscription(validations)).map(([subscriptionName, group]) => (
                  <div key={subscriptionName} className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900">
                        {subscriptionName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.placeName}
                      </p>
                      {group.startDate && group.endDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(group.startDate), 'PP')} → {format(new Date(group.endDate), 'PP')}
                        </p>
                      )}
                    </div>
                    
                    <div className="pl-4 space-y-3">
                      {group.validations.map((validation) => (
                        <div 
                          key={validation.id} 
                          className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:border-gray-200 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <time className="text-sm text-gray-500 tabular-nums">
                              {format(new Date(validation.validationDate), 'PPp')}
                            </time>
                            
                            {validation.remainingVisits !== null && (
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2" 
                                    style={{ 
                                      width: `${(validation.remainingVisits / (validation.remainingVisits + 5)) * 100}%`
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 tabular-nums">
                                  {validation.remainingVisits} {t('remainingVisits')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <FileText className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <p className="text-gray-600">{t('noValidationsFound')}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}