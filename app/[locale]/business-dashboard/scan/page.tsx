'use client'

import { QRScanner } from './components/qr-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ScanPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan Subscription QR</CardTitle>
        </CardHeader>
        <CardContent>
          <QRScanner />
        </CardContent>
      </Card>
    </div>
  )
}