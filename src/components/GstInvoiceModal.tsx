import React, { useState } from 'react';
import { Invoice } from '../types';
import { INSTITUTE_DETAILS } from '../data/seedData';
import { Printer, X, CheckCircle, MessageSquare, Send, CreditCard, Download } from 'lucide-react';

interface GstInvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onRecordPayment?: (invoiceNo: string, amount: number, mode: any, ref: string) => void;
}

export const GstInvoiceModal: React.FC<GstInvoiceModalProps> = ({
  invoice,
  onClose,
  onRecordPayment,
}) => {
  if (!invoice) return null;

  const [paymentAmount, setPaymentAmount] = useState<string>(
    invoice.balanceDue > 0 ? invoice.balanceDue.toString() : ''
  );
  const [paymentMode, setPaymentMode] = useState<'UPI (GPay / PhonePe)' | 'Bank Transfer / NEFT' | 'Cash Receipt' | 'Cheque'>(
    'UPI (GPay / PhonePe)'
  );
  const [txRef, setTxRef] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0 || !onRecordPayment) return;

    onRecordPayment(
      invoice.invoiceNo,
      amt,
      paymentMode,
      txRef || `TXN-${Date.now().toString().slice(-6)}`
    );
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 2500);
  };

  const generateWhatsAppReminderText = () => {
    return encodeURIComponent(
      `🏛️ *SKILLBRIDGE INSTITUTE BATHINDA*\n*FEE PAYMENT REMINDER & TAX INVOICE*\n\n` +
      `Dear Parent / Student ${invoice.studentName} (Roll: ${invoice.studentRollNo}),\n` +
      `Course: ${invoice.courseName}\n` +
      `Invoice No: ${invoice.invoiceNo}\n` +
      `Total Fee: ₹${invoice.totalAmount.toLocaleString('en-IN')}\n` +
      `Paid So Far: ₹${invoice.amountPaid.toLocaleString('en-IN')}\n` +
      `*PENDING BALANCE DUE: ₹${invoice.balanceDue.toLocaleString('en-IN')}*\n` +
      `Due Date: ${invoice.dueDate}\n\n` +
      `Bank UPI: ${INSTITUTE_DETAILS.bankDetails.upiId}\n` +
      `Bank: ${INSTITUTE_DETAILS.bankDetails.bankName}\n` +
      `A/C: ${INSTITUTE_DETAILS.bankDetails.accountNumber} (IFSC: ${INSTITUTE_DETAILS.bankDetails.ifsc})\n\n` +
      `Campus Address: ${INSTITUTE_DETAILS.address}, Bathinda.\n` +
      `Helpline: ${INSTITUTE_DETAILS.phone}\n\n` +
      `_Kindly clear the dues at your earliest convenience to avoid batch attendance interruption. Thank you!_`
    );
  };

  const handleCopyWhatsApp = () => {
    const rawText =
      `🏛️ SKILLBRIDGE INSTITUTE BATHINDA\nFEE PAYMENT REMINDER & TAX INVOICE\n\n` +
      `Dear Parent / Student ${invoice.studentName} (Roll: ${invoice.studentRollNo}),\n` +
      `Course: ${invoice.courseName}\n` +
      `Invoice No: ${invoice.invoiceNo}\n` +
      `Total Fee: ₹${invoice.totalAmount.toLocaleString('en-IN')}\n` +
      `Paid So Far: ₹${invoice.amountPaid.toLocaleString('en-IN')}\n` +
      `PENDING BALANCE DUE: ₹${invoice.balanceDue.toLocaleString('en-IN')}\n` +
      `Due Date: ${invoice.dueDate}\n\n` +
      `Bank UPI: ${INSTITUTE_DETAILS.bankDetails.upiId}\n` +
      `Campus Address: ${INSTITUTE_DETAILS.address}, Bathinda.\n` +
      `Helpline: ${INSTITUTE_DETAILS.phone}`;

    navigator.clipboard.writeText(rawText);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Tax Invoice · {invoice.invoiceNo}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                invoice.balanceDue === 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              {invoice.balanceDue === 0 ? 'Full Payment Settled' : `Pending: ₹${invoice.balanceDue.toLocaleString('en-IN')}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100" id="gst-invoice-printable">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
            <div>
              <div className="inline-block text-xs font-bold tracking-wider text-blue-700 dark:text-blue-400 uppercase">
                Official GST Tax Invoice · Education Services
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950 dark:text-white mt-1">
                {INSTITUTE_DETAILS.name}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                {INSTITUTE_DETAILS.address}, {INSTITUTE_DETAILS.city} - {INSTITUTE_DETAILS.pincode}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                <span>GSTIN: <strong className="text-slate-800 dark:text-slate-200">{INSTITUTE_DETAILS.gstin}</strong></span>
                <span>State Code: <strong className="text-slate-800 dark:text-slate-200">{INSTITUTE_DETAILS.stateCode}</strong></span>
                <span>SAC Code: <strong className="text-slate-800 dark:text-slate-200">{INSTITUTE_DETAILS.sacCode}</strong></span>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Invoice Details
              </div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                {invoice.invoiceNo}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Issue Date: <span className="font-medium text-slate-800 dark:text-slate-200">{invoice.issueDate}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Payment Due Date: <span className="font-medium text-amber-700 dark:text-amber-400">{invoice.dueDate}</span>
              </div>
              {invoice.transactionRef && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  Tx Ref: {invoice.transactionRef}
                </div>
              )}
            </div>
          </div>

          {/* Student Billing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Billed To (Student & Parent Details)
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {invoice.studentName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Roll Number: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{invoice.studentRollNo}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Contact: <span className="font-mono">{invoice.studentPhone}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Location: Bathinda, Punjab
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Program & Training Track
              </div>
              <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {invoice.courseName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Mode: Live Classroom & Digital Lab (Hybrid)
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Campus: Ajit Road Center, Bathinda
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Service: Commercial Coaching & Vocational Training
              </div>
            </div>
          </div>

          {/* Itemized Tax Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">SAC Code</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value</th>
                  <th className="py-2.5 px-3 text-right">CGST (9%)</th>
                  <th className="py-2.5 px-3 text-right">SGST (9%)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                <tr>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-medium text-slate-900 dark:text-white">
                      Course Tuition & Digital Module Access Fee
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {invoice.courseName} · Comprehensive Batch Enrollment
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">999293</td>
                  <td className="py-3 px-3 text-right text-slate-800 dark:text-slate-200">
                    ₹{invoice.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                    ₹{invoice.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                    ₹{invoice.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{invoice.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Institute Bank & UPI Details for Payment:
                </div>
                <div className="text-slate-600 dark:text-slate-400 space-y-0.5 font-mono">
                  <div>Account: <span className="text-slate-800 dark:text-slate-200">{INSTITUTE_DETAILS.bankDetails.accountName}</span></div>
                  <div>Bank: {INSTITUTE_DETAILS.bankDetails.bankName}</div>
                  <div>A/C No: <span className="font-bold text-slate-900 dark:text-white">{INSTITUTE_DETAILS.bankDetails.accountNumber}</span></div>
                  <div>IFSC Code: {INSTITUTE_DETAILS.bankDetails.ifsc}</div>
                  <div>UPI ID: <span className="font-bold text-blue-600 dark:text-blue-400">{INSTITUTE_DETAILS.bankDetails.upiId}</span></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                <span>Taxable Course Fee:</span>
                <span>₹{invoice.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                <span>Central GST (CGST @ 9%):</span>
                <span>₹{invoice.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                <span>State GST Punjab (SGST @ 9%):</span>
                <span>₹{invoice.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-950 dark:text-white">
                <span>Grand Total (Inclusive of GST):</span>
                <span>₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <span>Amount Paid:</span>
                <span>₹{invoice.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div
                className={`flex justify-between py-1.5 px-2.5 rounded-md font-bold text-sm ${
                  invoice.balanceDue > 0
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <span>Outstanding Balance Due:</span>
                <span>₹{invoice.balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer & Authorized Signatory */}
          <div className="flex flex-col sm:flex-row justify-between items-end pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-4">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Terms & Conditions:</p>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-2xs">
                <li>Fees once paid are non-refundable after 7 days of batch commencement.</li>
                <li>Receipt generated under Punjab Goods & Services Tax Act, 2017.</li>
                <li>This is an authorized computer-generated GST tax receipt.</li>
              </ul>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="w-40 border-b border-dashed border-slate-400 dark:border-slate-600 mb-1 h-10 flex items-center justify-center">
                <span className="font-serif italic text-blue-900 dark:text-blue-300 font-bold text-sm">
                  G.S. Brar
                </span>
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {INSTITUTE_DETAILS.director}
              </div>
              <div className="text-2xs text-slate-500 dark:text-slate-400">
                Authorized Signatory · SkillBridge Bathinda
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel for Admin & Student: Payment Simulator & WhatsApp Link (hidden in print) */}
        <div className="no-print p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* WhatsApp Reminder Dispatcher */}
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${generateWhatsAppReminderText()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Fee Reminder</span>
              </a>

              <button
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{copiedWhatsApp ? 'Copied WhatsApp Text!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              SAC 999293 · GSTIN Verified
            </div>
          </div>

          {/* Payment Collection Form (if balance remains and onRecordPayment is available) */}
          {invoice.balanceDue > 0 && onRecordPayment && (
            <form onSubmit={handlePaymentSubmit} className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Record Fee Payment:</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">₹</span>
                <input
                  type="number"
                  min="100"
                  max={invoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-28 px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="UPI (GPay / PhonePe)">UPI (GPay / PhonePe)</option>
                <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                <option value="Cash Receipt">Cash Receipt</option>
                <option value="Cheque">Cheque</option>
              </select>

              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder="Txn ID / Receipt No"
                className="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
              >
                Submit Payment
              </button>

              {paymentSuccess && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Updated!
                </span>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
