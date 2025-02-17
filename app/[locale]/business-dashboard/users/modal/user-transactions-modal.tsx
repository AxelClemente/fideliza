'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useTranslations } from "use-intl"
import { useSubscribers } from "../../context/subscribers-context"

interface Transaction {
  id: string
  code: string
  timestamp: Date
  subscriptionType: string
  remainingVisits: number | null
}

interface UserTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  subscriberId: string | null
  restaurantId: string
}

export function UserTransactionsModal({ 
  isOpen, 
  onClose, 
  subscriberId,
  restaurantId 
}: UserTransactionsModalProps) {
  const t = useTranslations('BusinessDashboard')
  const { subscribers } = useSubscribers()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && subscriberId) {
      const subscriber = subscribers.find(sub => sub.id === subscriberId)
      console.log('Found subscriber:', subscriber)
      
      if (subscriber) {
        fetchTransactions(subscriberId, restaurantId)
      }
    }
  }, [isOpen, subscriberId, subscribers, restaurantId])

  const fetchTransactions = async (userId: string, subscriptionId: string) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(
        `/api/user-transactions?subscriberId=${userId}&subscriptionId=${subscriptionId}`
      )
      
      const data = await response.json()

      if (response.ok) {
        setTransactions(data.transactions)
      } else {
        setError(data.error || 'Error fetching transactions')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('Error loading transactions')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {t('transactionHistory')}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {t('noTransactionsFound')}
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">{t('operationCode')}</p>
                      <p className="font-medium">{transaction.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('date')}</p>
                      <p className="font-medium">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('subscriptionType')}</p>
                      <p className="font-medium">{transaction.subscriptionType}</p>
                    </div>
                    {transaction.remainingVisits !== null && (
                      <div>
                        <p className="text-sm text-gray-500">{t('remainingVisits')}</p>
                        <p className="font-medium">{transaction.remainingVisits}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}