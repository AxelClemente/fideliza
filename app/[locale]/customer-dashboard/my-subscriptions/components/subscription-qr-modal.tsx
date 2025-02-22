'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "react-qr-code"
import { useEffect, useState } from "react"

interface SubscriptionQRModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionData: {
    id: string
    remainingVisits: number | null
    place: {
      name: string
      restaurant: {
        title: string
      }
    }
  }
}

export function SubscriptionQRModal({ isOpen, onClose, subscriptionData }: SubscriptionQRModalProps) {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  useEffect(() => {
    console.log('Modal opened, subscription data:', {
      id: subscriptionData.id,
      remainingVisits: subscriptionData.remainingVisits,
      place: subscriptionData.place.name,
      restaurant: subscriptionData.place.restaurant.title
    });

    if (isOpen) {
      generateCode();
    } else {
      setGeneratedCode(null);
    }
  }, [isOpen, subscriptionData.id]);

  const generateCode = async () => {
    try {
      console.log('Generating code for subscription:', subscriptionData.id);
      
      const response = await fetch('/api/subscription-codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionData.id,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        console.error('API Error:', data.error);
        return;
      }

      if (data.success && data.code) {
        console.log('Code generated successfully:', data.code);
        setGeneratedCode(data.code);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  if (!generatedCode) {
    console.log('No code generated yet');
    return null;
  }

  const qrValue = JSON.stringify({
    code: generatedCode
  });

  console.log('Rendering QR with value:', qrValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Subscription QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <QRCode
            value={qrValue}
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
          <p className="mt-4 text-sm text-center text-gray-500">
            Show this QR code at {subscriptionData.place.restaurant.title}
          </p>
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Numeric Code:</p>
            <p className="text-2xl font-bold tracking-wider text-center">
              {generatedCode.match(/.{1,4}/g)?.join(' ')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}