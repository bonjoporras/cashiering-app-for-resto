import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Plus, ShoppingBag, Printer } from 'lucide-react';
import { CartItem, AppSettings } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cartItems: CartItem[];
  customerName: string;
  onConfirmPayment: () => void;
  settings: AppSettings;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  cartItems,
  customerName,
  onConfirmPayment,
  settings,
}) => {
  const [cashReceived, setCashReceived] = useState<string>('');
  const [step, setStep] = useState<'payment' | 'receipt'>('payment');

  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setCashReceived('');
    }
  }, [isOpen]);

  // Handle Print Summary (formerly Export logic)
  const handlePrintSummary = () => {
    // Generate text content for the file
    const date = new Date().toLocaleString();
    const line = "----------------------------------------";
    
    let content = `${settings.appName.toUpperCase()}\n`;
    content += `ORDER SUMMARY\n`;
    content += `${line}\n`;
    content += `Date:     ${date}\n`;
    content += `Customer: ${customerName}\n`;
    content += `${line}\n`;
    content += `QTY   ITEM                          PRICE\n`;
    content += `${line}\n`;

    cartItems.forEach(item => {
      // Format: "2x    Burger                        500.00"
      const qty = `${item.quantity}x`.padEnd(6);
      const name = item.name.padEnd(28).slice(0, 28);
      const price = (item.price * item.quantity).toFixed(2).padStart(8);
      content += `${qty}${name}${price}\n`;
    });

    content += `${line}\n`;
    content += `TOTAL:                          ${total.toFixed(2)}\n`;
    content += `${line}\n`;

    // 1. Trigger Download ("Locate")
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.txt'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Open in new window and Automatic Print
    const printWindow = window.open('', '_blank', 'width=900,height=600');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Order Summary - ${customerName}</title>
                    <style>
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            white-space: pre; 
                            padding: 40px; 
                            font-size: 14px;
                            line-height: 1.2;
                            color: #000;
                        }
                        @media print {
                            body { padding: 0; margin: 0; }
                        }
                    </style>
                </head>
                <body>${content}</body>
                <script>
                    window.onload = function() {
                        // Small delay to ensure content renders before print
                        setTimeout(function() { 
                            window.print(); 
                        }, 500);
                    };
                </script>
            </html>
        `);
        printWindow.document.close();
    }

    // 3. Assist in "Locating" it
    setTimeout(() => {
       alert("Export successful!\n\nFile 'orders.txt' has been saved to your Downloads folder.");
       URL.revokeObjectURL(url);
    }, 800);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Support Ctrl+P, Cmd+P (Mac), and Alt+P
      const isPrintKey = (e.ctrlKey || e.metaKey || e.altKey) && e.key.toLowerCase() === 'p';
      
      if (isOpen && isPrintKey) {
        e.preventDefault();
        if (step === 'payment') {
          // Ctrl+P now triggers the Export & Auto-Print flow
          handlePrintSummary();
        } else {
          handlePrintReceipt();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, cartItems, total, customerName, settings]);

  // Function to generate a Bell "Ting" sound using Web Audio API
  const playBellSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // High frequency sine wave for "ting"
        osc.type = 'sine';
        osc.frequency.value = 2000; // 2kHz

        // Envelope for sharp attack and decay
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Long Decay

        osc.start(now);
        osc.stop(now + 1.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  const handlePayment = () => {
    onConfirmPayment();
    setStep('receipt');

    // Play Bell Sound Twice
    playBellSound();
    setTimeout(() => {
        playBellSound();
    }, 400); // 400ms delay between rings

    // Text to Speech
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`${customerName} already paid, thank you.`);
        window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  const receivedAmount = parseFloat(cashReceived) || 0;
  const change = receivedAmount - total;
  const canPay = receivedAmount >= total;

  return (
    <>
      {/* --- SCREEN UI --- */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {step === 'payment' ? 'Confirm Order & Payment' : 'Transaction Complete'}
            </h2>
            <div className="flex items-center gap-2">
               <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                 <X size={24} />
               </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 'payment' ? (
              <div className="flex flex-col md:flex-row gap-8 h-full">
                
                {/* Order Summary Column */}
                <div className="flex-1 flex flex-col min-h-0 border-r border-slate-100 dark:border-slate-700 pr-6">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <ShoppingBag size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Order Summary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handlePrintSummary}
                          className="flex items-center gap-1 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 text-xs font-bold transition-colors"
                          title="Print Order Summary (Cmd+P / Ctrl+P)"
                        >
                          <Printer size={14} />
                          <span className="hidden sm:inline">Print</span>
                        </button>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[300px] scrollbar-hide">
                      {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-start text-sm">
                              <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                                  <p className="text-slate-500 dark:text-slate-400 text-xs">{item.quantity} x ₱{item.price.toFixed(2)}</p>
                              </div>
                              <p className="font-medium text-slate-800 dark:text-slate-200">₱{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                      ))}
                   </div>
                   <div className="border-t border-slate-200 dark:border-slate-600 mt-4 pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Total Amount</span>
                      <span className="font-bold text-xl text-slate-900 dark:text-white">₱{total.toFixed(2)}</span>
                   </div>
                </div>

                {/* Payment Input Column */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center py-4 mb-4">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Due</p>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">₱{total.toFixed(2)}</p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cash Received</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-lg font-semibold dark:text-white"
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex justify-between items-center border border-slate-100 dark:border-slate-700 mb-6">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Change Due</span>
                      <span className={`text-xl font-bold ${change >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-600'}`}>
                        ₱{Math.max(0, change).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={!canPay}
                      className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold shadow-md transition-all flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Confirm Payment
                    </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle size={40} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Payment Successful!</h3>
                  <p className="text-slate-500 dark:text-slate-400">Change given: <span className="font-bold text-slate-800 dark:text-white">₱{Math.max(0, change).toFixed(2)}</span></p>
                </div>

                <div className="flex gap-3 justify-center max-w-sm mx-auto">
                    <button
                        onClick={handlePrintReceipt}
                        className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Print Receipt (Cmd+P / Ctrl+P)"
                    >
                        <Printer size={20} /> 
                        Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-[2] bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white py-3 rounded-xl font-semibold shadow-md transition-all flex justify-center items-center gap-2"
                    >
                        <Plus size={20} />
                        New Order
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PRINTABLE DOCUMENT (PDF Format / A4) --- */}
      <div className="hidden print:block fixed inset-0 bg-white z-[10000] p-10 text-slate-900 w-full h-full top-0 left-0 overflow-visible">
          <div className="max-w-3xl mx-auto border border-slate-200 p-8 rounded-sm">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                  <div>
                      <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-800">{settings.appName}</h1>
                      <p className="text-sm text-slate-500 mt-1">Official Receipt</p>
                  </div>
                  {settings.appLogo !== 'default' && (
                      <img src={settings.appLogo} alt="Logo" className="h-16 w-auto object-contain" />
                  )}
              </div>
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                  <div>
                      <p className="font-bold text-slate-400 uppercase text-xs mb-1">Customer</p>
                      <p className="font-bold text-lg">{customerName}</p>
                  </div>
                  <div className="text-right">
                      <p className="font-bold text-slate-400 uppercase text-xs mb-1">Date Issued</p>
                      <p className="font-bold">{new Date().toLocaleDateString()}</p>
                      <p className="text-slate-500">{new Date().toLocaleTimeString()}</p>
                  </div>
              </div>

              {/* Table */}
              <table className="w-full text-sm mb-8 border-collapse">
                  <thead>
                      <tr className="border-b-2 border-slate-800">
                          <th className="text-left py-3 font-bold text-slate-700">Item Description</th>
                          <th className="text-center py-3 font-bold text-slate-700">Qty</th>
                          <th className="text-right py-3 font-bold text-slate-700">Price</th>
                          <th className="text-right py-3 font-bold text-slate-800">Amount</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                      {cartItems.map((item) => (
                          <tr key={item.id}>
                              <td className="py-3 text-slate-700">{item.name}</td>
                              <td className="text-center py-3 text-slate-700">{item.quantity}</td>
                              <td className="text-right py-3 text-slate-700">₱{item.price.toFixed(2)}</td>
                              <td className="text-right py-3 font-bold text-slate-800">₱{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              {/* Totals */}
              <div className="flex flex-col items-end space-y-2 border-t-2 border-slate-800 pt-4">
                  <div className="flex justify-between w-64 text-sm">
                      <span className="font-medium text-slate-600">Subtotal</span>
                      <span className="font-medium text-slate-800">₱{cartItems.reduce((a, c) => a + c.price * c.quantity, 0).toFixed(2)}</span>
                  </div>
                  {receivedAmount > 0 && (
                     <>
                        <div className="flex justify-between w-64 text-sm">
                            <span className="font-medium text-slate-600">Cash Received</span>
                            <span className="font-medium text-slate-800">₱{receivedAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm">
                            <span className="font-medium text-slate-600">Change</span>
                            <span className="font-medium text-slate-800">₱{Math.max(0, change).toFixed(2)}</span>
                        </div>
                     </>
                  )}
                  <div className="flex justify-between w-64 text-xl font-bold mt-2 pt-2 border-t border-slate-100">
                      <span>Total</span>
                      <span>₱{total.toFixed(2)}</span>
                  </div>
              </div>
              
              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
                  <p className="font-medium text-slate-500 mb-1">Thank you for your business!</p>
                  <p>System generated report • {settings.appName}</p>
              </div>
          </div>
      </div>
    </>
  );
};