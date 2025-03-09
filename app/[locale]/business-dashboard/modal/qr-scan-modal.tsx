'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Html5QrcodeScanner } from "html5-qrcode"

interface QRScanModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SubscriptionDetails {
  userName: string
  subscriptionName: string
  remainingVisits: number | null
  placeName: string
  startDate: string
  endDate: string
  status: string
  userId: string
}

export function QRScanModal({ isOpen, onClose }: QRScanModalProps) {
  const { data: session } = useSession()
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setManualCode('')
      setError('')
      setSubscriptionDetails(null)
      setShowConfirmation(false)
      setIsProcessing(false)
      setIsScanning(false)
      
      // Limpiar el escáner si existe
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
        scannerRef.current = null;
      }
    }
  }, [isOpen])

  // Iniciar el escáner cuando se activa el modo de escaneo
  useEffect(() => {
    if (isOpen && isScanning && scannerDivRef.current && !scannerRef.current && !showConfirmation) {
      try {
        const qrScanner = new Html5QrcodeScanner(
          "qr-reader", 
          { 
            fps: 10,
            qrbox: 250,
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          },
          false // No iniciar el escaneo automáticamente
        );
        
        qrScanner.render(onScanSuccess, onScanError);
        scannerRef.current = qrScanner;
        
        console.log("QR scanner initialized");
      } catch (error) {
        console.error("Error initializing QR scanner:", error);
        setError("Could not initialize camera. Please check permissions or try manual entry.");
        setIsScanning(false);
      }
    }
    
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
        scannerRef.current = null;
      }
    };
  }, [isOpen, isScanning, showConfirmation]);

  const onScanSuccess = (decodedText: string) => {
    console.log("QR code scanned successfully:", decodedText);
    
    try {
      // Intentar parsear el JSON del código QR
      const qrData = JSON.parse(decodedText);
      
      if (qrData && qrData.code) {
        // Detener el escáner
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (error) {
            console.error("Error clearing scanner:", error);
          }
          scannerRef.current = null;
        }
        
        setIsScanning(false);
        setManualCode(qrData.code);
        
        // Procesar el código automáticamente
        processCode(qrData.code);
      } else {
        setError("Invalid QR code format");
      }
    } catch (error) {
      console.error("Error parsing QR code:", error);
      setError("Invalid QR code format");
    }
  };

  const onScanError = (errorMessage: string) => {
    console.error("QR scan error:", errorMessage);
    // No mostrar errores durante el escaneo normal para evitar mensajes molestos
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    setError('');
    
    if (scannerRef.current && isScanning) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error("Error clearing scanner:", error);
      }
      scannerRef.current = null;
    }
  };

  const processCode = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }

    setError('');
    setIsProcessing(true);
    setShowConfirmation(false);

    try {
      console.log('Checking code:', code);
      
      const response = await fetch('/api/validate-subscription/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log('Check response:', data);

      if (response.ok && data.subscription) {
        setSubscriptionDetails(data.subscription);
        setShowConfirmation(true);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (error) {
      console.error('Error checking code:', error);
      setError('Error checking code');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkSubscription = () => {
    processCode(manualCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showConfirmation) {
      await checkSubscription();
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      // Primero validamos la suscripción (esto ya funciona)
      const response = await fetch('/api/validate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: manualCode }),
      });

      const data = await response.json();
      console.log('Validation response:', data);

      if (response.ok) {
        // Si la validación fue exitosa, guardamos el registro
        const validationResponse = await fetch('/api/validate-subscription/save-validation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriberId: subscriptionDetails?.userId,
            subscriptionId: data.subscriptionId,
            subscriptionName: subscriptionDetails?.subscriptionName,
            remainingVisits: data.remainingVisits,
            placeId: data.placeId,
            placeName: subscriptionDetails?.placeName,
            staffId: session?.user?.id,
            ownerId: session?.user?.ownerId,
            status: subscriptionDetails?.status,
            startDate: subscriptionDetails?.startDate,
            endDate: subscriptionDetails?.endDate
          }),
        });

        const validationData = await validationResponse.json();
        console.log('Validation record saved:', validationData);

        setManualCode('');
        setSubscriptionDetails(null);
        setShowConfirmation(false);
        onClose();
      } else {
        setError(data.error || 'Error validating code');
      }
    } catch (error) {
      console.error('Error processing code:', error);
      setError('Error processing code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para formatear la fecha actual
  const getCurrentDateTime = () => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(new Date());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {showConfirmation ? 'Confirm Subscription' : 'Scan Subscription QR'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center px-4">
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {!showConfirmation ? (
              <>
                {/* Botón para alternar entre escaneo y entrada manual */}
                <button
                  type="button"
                  onClick={toggleScanner}
                  className="mb-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isScanning ? "Switch to Manual Entry" : "Scan QR Code with Camera"}
                </button>
                
                {isScanning ? (
                  <div className="mb-4">
                    <div id="qr-reader" ref={scannerDivRef} className="w-full max-w-[329px] mx-auto"></div>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Position the QR code within the frame to scan
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-gray-500">Enter Code Manually:</label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="w-[329px] h-[78px] p-2 mt-1 rounded-[100px] bg-main-gray pl-6 border-0 
                               text-[16px] font-semibold text-third-gray
                               placeholder:text-third-gray placeholder:text-[16px] placeholder:font-semibold
                               focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Enter 8-digit code"
                      maxLength={8}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-[50vh] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-2">Subscription Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">{getCurrentDateTime()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{subscriptionDetails?.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subscription</p>
                    <p className="font-medium">{subscriptionDetails?.subscriptionName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Place</p>
                    <p className="font-medium">{subscriptionDetails?.placeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {subscriptionDetails?.startDate ? new Date(subscriptionDetails.startDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {subscriptionDetails?.endDate ? new Date(subscriptionDetails.endDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${
                      subscriptionDetails?.status === 'ACTIVE' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {subscriptionDetails?.status}
                    </p>
                  </div>
                  {subscriptionDetails?.remainingVisits !== null && (
                    <div>
                      <p className="text-sm text-gray-500">Remaining Visits</p>
                      <p className="font-medium">{subscriptionDetails?.remainingVisits}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <div className="flex flex-col space-y-2 pt-2">
              <button
                type="submit"
                disabled={isProcessing || (isScanning && !manualCode)}
                className="h-[60px] w-full rounded-[100px] bg-main-dark text-white 
                         hover:bg-main-dark/90 disabled:opacity-50 text-[16px] font-semibold"
              >
                {isProcessing 
                  ? 'Processing...' 
                  : showConfirmation 
                    ? 'Confirm Validation'
                    : 'Check Code'
                }
              </button>
              {showConfirmation && (
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="h-[60px] w-full rounded-[100px] border-[1px] border-third-gray/30 
                           text-[16px] font-semibold bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}