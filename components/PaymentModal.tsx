
import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Plus, ShoppingBag, Printer } from 'lucide-react';
import { CartItem, AppSettings } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  subtotal: number;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  onUpdateDiscount: (type: 'percent' | 'fixed', value: number) => void;
  cartItems: CartItem[];
  customerName: string;
  onConfirmPayment: () => void;
  settings: AppSettings;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  subtotal,
  discountType,
  discountValue,
  onUpdateDiscount,
  cartItems,
  customerName,
  onConfirmPayment,
  settings,
}) => {
  const [cashReceived, setCashReceived] = useState<string>('');
  const [step, setStep] = useState<'payment' | 'receipt'>('payment');

  // Local state to persist order details for receipt after parent cart is cleared
  const [finalCartItems, setFinalCartItems] = useState<CartItem[]>([]);
  const [finalTotal, setFinalTotal] = useState(0);
  const [finalSubtotal, setFinalSubtotal] = useState(0);
  const [finalDiscountValue, setFinalDiscountValue] = useState(0);
  const [finalDiscountType, setFinalDiscountType] = useState<'percent' | 'fixed'>('fixed');

  // Sync props to local state while in payment step
  useEffect(() => {
    if (isOpen && step === 'payment') {
      setFinalCartItems(cartItems);
      setFinalTotal(total);
      setFinalSubtotal(subtotal);
      setFinalDiscountValue(discountValue);
      setFinalDiscountType(discountType);
    }
  }, [isOpen, step, cartItems, total, subtotal, discountValue, discountType]);

  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setCashReceived('');
    }
  }, [isOpen]);

  // Use these variables for display/printing to handle both steps correctly
  const displayItems = step === 'receipt' ? finalCartItems : cartItems;
  const displayTotal = step === 'receipt' ? finalTotal : total;
  const displaySubtotal = step === 'receipt' ? finalSubtotal : subtotal;
  const displayDiscountValue = step === 'receipt' ? finalDiscountValue : discountValue;
  const displayDiscountType = step === 'receipt' ? finalDiscountType : discountType;

  // Common Receipt Generator Function
  const generateReceiptContent = (isOfficial: boolean) => {
    const received = parseFloat(cashReceived) || 0;
    const changeAmount = received - displayTotal;
    
    let discountAmount = 0;
    if (displayDiscountType === 'percent') {
        discountAmount = displaySubtotal * (displayDiscountValue / 100);
    } else {
        discountAmount = displayDiscountValue;
    }

    return `
      <html>
          <head>
              <title>${isOfficial ? 'Receipt' : 'Order Summary'} - ${customerName}</title>
              <style>
                  body { 
                      font-family: 'Courier New', Courier, monospace; 
                      width: 56mm; 
                      margin: 0;
                      padding: 5px; 
                      font-size: 11px;
                      line-height: 1.2;
                      color: #000;
                  }
                  .text-center { text-align: center; }
                  .text-right { text-align: right; }
                  .flex-between { display: flex; justify-content: space-between; }
                  .bold { font-weight: bold; }
                  .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
                  .border-top { border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; }
                  .item-row { margin-bottom: 3px; }
                  .item-details { font-size: 10px; padding-left: 5px; display: flex; justify-content: space-between; }
                  table { width: 100%; border-collapse: collapse; }
                  td { vertical-align: top; }
                  @media print {
                      body { padding: 0; margin: 0; width: 56mm; }
                      @page { margin: 0; size: 58mm auto; }
                  }
              </style>
          </head>
          <body>
              <div class="text-center border-bottom">
                  ${isOfficial && settings.appLogo !== 'default' ? `<img src="${settings.appLogo}" style="height: 40px; margin-bottom: 5px; filter: grayscale(100%);" />` : ''}
                  <div class="bold" style="font-size: 14px;">${settings.appName}</div>
                  <div>${isOfficial ? 'OFFICIAL RECEIPT' : 'ORDER SUMMARY'}</div>
              </div>
              
              <div class="border-bottom">
                  <div class="flex-between"><span>Date:</span><span>${new Date().toLocaleDateString()}</span></div>
                  <div class="flex-between"><span>Time:</span><span>${new Date().toLocaleTimeString()}</span></div>
                  <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #000;">
                    Customer: <span class="bold">${customerName}</span>
                  </div>
              </div>

              <div class="border-bottom">
                  <div class="text-center bold" style="margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 2px;">ORDER SUMMARY</div>
                  <table>
                  ${displayItems.map(item => `
                      <tr>
                          <td colspan="2" style="padding-top: 2px;">${item.name}</td>
                      </tr>
                      <tr>
                          <td style="padding-left: 10px; font-size: 10px;">${item.quantity} x ${item.price.toFixed(2)}</td>
                          <td class="text-right" style="font-size: 10px;">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                  `).join('')}
                  </table>
              </div>
              
              <div class="border-bottom">
                   <div class="flex-between">
                      <span>Subtotal</span>
                      <span>${displaySubtotal.toFixed(2)}</span>
                   </div>
                   ${displayDiscountValue > 0 ? `
                   <div class="flex-between">
                      <span>Discount (${displayDiscountType === 'percent' ? displayDiscountValue + '%' : 'Fixed'})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                   </div>
                   ` : ''}
              </div>

              <div class="border-bottom bold">
                   <div class="flex-between" style="font-size: 14px;">
                      <span>TOTAL</span>
                      <span>${displayTotal.toFixed(2)}</span>
                   </div>
              </div>
              
              ${(isOfficial || received > 0) ? `
              <div class="border-bottom">
                   <div class="flex-between">
                      <span>Cash</span>
                      <span>${received.toFixed(2)}</span>
                   </div>
                   <div class="flex-between">
                      <span>Change</span>
                      <span>${Math.max(0, changeAmount).toFixed(2)}</span>
                   </div>
              </div>
              ` : ''}
              
              <div class="text-center" style="font-size: 9px; margin-top: 10px;">
                  ${isOfficial ? `
                  <p>Thank you for your business!</p>
                  <p>POS: ${settings.appName}</p>
                  ` : `
                  <p>-- Summary Only --</p>
                  `}
              </div>
          </body>
          <script>
              window.onload = function() {
                  setTimeout(function() { 
                      window.print(); 
                  }, 500);
              };
          </script>
      </html>
    `;
  };

  // Handle Print Summary (formerly Export logic)
  const handlePrintSummary = async () => {
    // Generate text content for the file download (optional backup)
    const now = new Date();
    const date = now.toLocaleString();
    const line = "-".repeat(32);
    
    // Create a filename that is unique and descriptive
    const dateFilename = now.toLocaleDateString().replace(/\//g, '-');
    const timeFilename = now.toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '');
    const sanitizedCustomer = customerName.replace(/[^a-z0-9]/gi, '_');
    const filename = `Receipt-${sanitizedCustomer}-${dateFilename}-${timeFilename}.txt`;

    const received = parseFloat(cashReceived) || 0;
    const changeAmount = received - displayTotal;

    let discountAmount = 0;
    if (displayDiscountType === 'percent') {
        discountAmount = displaySubtotal * (displayDiscountValue / 100);
    } else {
        discountAmount = displayDiscountValue;
    }

    let content = `${settings.appName.toUpperCase()}\n`;
    content += `ORDER SUMMARY\n`;
    content += `${line}\n`;
    content += `Date: ${date}\n`;
    content += `Customer: ${customerName}\n`;
    content += `${line}\n`;

    displayItems.forEach(item => {
      content += `${item.name}\n`;
      content += `  ${item.quantity} x ${item.price.toFixed(2)} = ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    content += `${line}\n`;
    content += `Subtotal: ${displaySubtotal.toFixed(2)}\n`;
    if (displayDiscountValue > 0) {
        content += `Discount (${displayDiscountType === 'percent' ? displayDiscountValue + '%' : 'Fixed'}): -${discountAmount.toFixed(2)}\n`;
    }
    content += `TOTAL: ${displayTotal.toFixed(2)}\n`;
    
    if (received > 0) {
      content += `Cash: ${received.toFixed(2)}\n`;
      content += `Change: ${Math.max(0, changeAmount).toFixed(2)}\n`;
    }
    
    content += `${line}\n`;

    // 1. Trigger Save/Download
    try {
        if ('showSaveFilePicker' in window) {
            const opts = {
                suggestedName: filename,
                types: [{
                    description: 'Receipt Text File',
                    accept: { 'text/plain': ['.txt'] },
                }],
            };
            // @ts-ignore
            const handle = await window.showSaveFilePicker(opts);
            // @ts-ignore
            const writable = await handle.createWritable();
            // @ts-ignore
            await writable.write(content);
            // @ts-ignore
            await writable.close();
        } else {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (err) {
        console.log("Save cancelled or failed:", err);
    }

    // 2. Open in new window and Automatic Print
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
        printWindow.document.write(generateReceiptContent(false));
        printWindow.document.close();
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
        printWindow.document.write(generateReceiptContent(true));
        printWindow.document.close();
    }
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
  }, [isOpen, step, displayItems, displayTotal, customerName, settings, cashReceived]);

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
    // Note: We don't need to explicitly save state here because useEffect
    // keeps final* vars updated as long as step === 'payment'.
    // Changing step to 'receipt' stops the updates, preserving the snapshot.
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
  const change = receivedAmount - displayTotal;
  const canPay = receivedAmount >= displayTotal;

  let discountAmount = 0;
  if (displayDiscountType === 'percent') {
    discountAmount = displaySubtotal * (displayDiscountValue / 100);
  } else {
    discountAmount = displayDiscountValue;
  }

  return (
    <>
      {/* --- SCREEN UI --- */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

                   {/* Customer Name Display */}
                   <div className="mb-3 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Customer</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{customerName}</span>
                   </div>

                   <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[220px] scrollbar-hide">
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
                   
                   {/* Discount Controls */}
                   <div className="border-t border-slate-200 dark:border-slate-600 mt-auto pt-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                            <span className="font-medium text-slate-800 dark:text-white">₱{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Discount</span>
                                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600">
                                    <button 
                                    onClick={() => onUpdateDiscount('fixed', discountValue)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${discountType === 'fixed' ? 'bg-white dark:bg-slate-600 shadow-sm text-brand-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    >₱</button>
                                    <button 
                                    onClick={() => onUpdateDiscount('percent', discountValue)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${discountType === 'percent' ? 'bg-white dark:bg-slate-600 shadow-sm text-brand-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    >%</button>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {discountType === 'fixed' && <span className="text-xs text-slate-400 font-bold">₱</span>}
                                <input 
                                    type="number" 
                                    min="0"
                                    value={discountValue || ''} 
                                    onChange={(e) => onUpdateDiscount(discountType, parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-bold focus:ring-1 focus:ring-brand-500 outline-none dark:text-white"
                                    placeholder="0"
                                />
                                {discountType === 'percent' && <span className="text-xs text-slate-400 font-bold">%</span>}
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-red-500 font-bold">
                            <span>- {discountType === 'percent' ? `${discountValue}%` : 'Discount'}</span>
                            <span>(₱{(subtotal - total).toFixed(2)})</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-dashed border-slate-300 dark:border-slate-600 pt-2 mt-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Total Amount</span>
                            <span className="font-bold text-xl text-slate-900 dark:text-white">₱{total.toFixed(2)}</span>
                        </div>
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
              <div className="flex flex-col h-full">
                  <div className="text-center py-6 shrink-0">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Payment Successful</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Change: <span className="font-bold text-slate-800 dark:text-white">₱{Math.max(0, change).toFixed(2)}</span></p>
                  </div>

                  {/* Order Summary on Success Screen */}
                  <div className="flex-1 overflow-y-auto px-6 mb-4">
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                             <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order Summary</h4>
                             <span className="text-xs font-bold text-slate-800 dark:text-white">{customerName}</span>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                              {displayItems.map(item => (
                                  <div key={item.id} className="text-sm">
                                      <div className="flex justify-between items-start mb-0.5">
                                          <div className="font-bold text-slate-800 dark:text-white">{item.name}</div>
                                          <div className="font-bold text-slate-900 dark:text-white">₱{(item.price * item.quantity).toFixed(2)}</div>
                                      </div>
                                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                                          {item.quantity} x ₱{item.price.toFixed(2)}
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm">
                              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                  <span>Subtotal</span>
                                  <span>₱{displaySubtotal.toFixed(2)}</span>
                              </div>
                              {displayDiscountValue > 0 && (
                                  <div className="flex justify-between text-brand-600 dark:text-brand-400">
                                      <span>Discount</span>
                                      <span>-₱{discountAmount.toFixed(2)}</span>
                                  </div>
                              )}
                              <div className="flex justify-between font-bold text-lg text-slate-800 dark:text-white pt-2">
                                  <span>Total</span>
                                  <span>₱{displayTotal.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="px-6 pb-6 shrink-0 flex gap-3">
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
    </>
  );
};
