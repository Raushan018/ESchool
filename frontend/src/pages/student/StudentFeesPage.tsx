import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, CreditCard, Smartphone, Building2, QrCode,
  CheckCircle, ChevronLeft, Loader2, History, User, XCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { useStudentId } from '../../hooks/useStudentId';
import { formatCurrency } from '../../utils/helpers';
import type { FeeRecord } from '../../types';

// ─── Receipt Generator ────────────────────────────────────────────────────────
function buildReceiptHTML(
  fees: FeeRecord[],
  student: { name: string; rollNumber: string; department: string; batch: string },
  semester: string,
  paymentMethod: string,
  txnId: string,
  paidOn: string,
) {
  const total = fees.reduce((a, f) => a + f.amount, 0);
  const rows = fees
    .map((f) => `
      <tr>
        <td>${f.feeType}</td>
        <td style="text-align:right">₹${f.amount.toLocaleString('en-IN')}</td>
        <td style="text-align:right">₹0.00</td>
        <td style="text-align:right">₹${f.amount.toLocaleString('en-IN')}</td>
      </tr>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Fee Receipt – ${txnId}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;margin:0;padding:0;color:#1f2937;background:#fff}
    .page{max-width:700px;margin:40px auto;padding:44px;border:1px solid #e5e7eb;border-radius:14px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:22px;margin-bottom:24px;border-bottom:2px solid #1a3a6b}
    .logo{font-size:22px;font-weight:800;color:#1a3a6b}
    .logo span{display:block;font-size:11px;font-weight:400;color:#6b7280;margin-top:2px}
    .receipt-meta{text-align:right;font-size:12px;color:#6b7280}
    .receipt-meta strong{display:block;font-size:20px;color:#111827;font-weight:800}
    .section{margin-bottom:22px}
    .section h4{font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin:0 0 10px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}
    .info-item{font-size:13px}
    .info-item span{display:block;font-size:10px;color:#9ca3af;margin-bottom:2px}
    table{width:100%;border-collapse:collapse;font-size:14px}
    thead tr{background:#f9fafb}
    th{padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;border-bottom:2px solid #e5e7eb}
    th:not(:first-child),td:not(:first-child){text-align:right}
    td{padding:10px 12px;border-bottom:1px solid #f3f4f6}
    .total-row td{font-size:16px;font-weight:800;border-top:2px solid #1a3a6b;border-bottom:none;padding-top:14px;color:#111827}
    .badge-success{background:#d1fae5;color:#065f46;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700}
    .payment-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
    .footer{margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;line-height:1.8}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">EduManage<span>Institute Management System</span></div>
    <div class="receipt-meta">
      <strong>${txnId}</strong>
      Official Fee Receipt
      <div style="margin-top:8px"><span class="badge-success">PAID</span></div>
    </div>
  </div>
  <div class="section">
    <h4>Student Information</h4>
    <div class="info-grid">
      <div class="info-item"><span>Full Name</span>${student.name}</div>
      <div class="info-item"><span>Roll Number</span>${student.rollNumber}</div>
      <div class="info-item"><span>Department</span>${student.department}</div>
      <div class="info-item"><span>Batch</span>${student.batch}</div>
    </div>
  </div>
  <div class="section">
    <h4>Bill Details</h4>
    <div class="info-grid">
      <div class="info-item"><span>Billing Period</span>${semester}</div>
      <div class="info-item"><span>Payment Date</span>${paidOn}</div>
      <div class="info-item"><span>Payment Method</span>${paymentMethod}</div>
      <div class="info-item"><span>Transaction ID</span>${txnId}</div>
    </div>
  </div>
  <div class="section">
    <h4>Charges Breakdown</h4>
    <table>
      <thead><tr><th>Fee Type</th><th>Amount</th><th>Late Fee</th><th>Total Fee</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td>Total Amount</td><td></td><td></td>
          <td style="text-align:right">₹${total.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="payment-box">
    <div>
      <div style="font-size:12px;color:#6b7280">Amount Paid via ${paymentMethod}</div>
      <div style="font-size:22px;font-weight:800;color:#059669">₹${total.toLocaleString('en-IN')}</div>
    </div>
    <span class="badge-success" style="font-size:13px;padding:6px 18px">PAYMENT SUCCESSFUL</span>
  </div>
  <div class="footer">
    This is a system-generated receipt. No signature required.<br/>
    Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; EduManage Institute ERP
  </div>
</div>
</body>
</html>`;
}

function triggerReceiptDownload(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'credit',     label: 'Credit Card',      icon: CreditCard },
  { id: 'debit',      label: 'Debit Card',        icon: CreditCard },
  { id: 'netbanking', label: 'Internet Banking',  icon: Building2 },
  { id: 'qr',         label: 'QR Code',           icon: QrCode },
  { id: 'upi',        label: 'UPI',               icon: Smartphone },
];

type PageView = 'fees' | 'payment' | 'processing' | 'success' | 'history';

// ─── Student Profile Sidebar ──────────────────────────────────────────────────
function StudentProfile({ student }: {
  student: { name: string; rollNumber: string; department: string; batch: string; email: string; phone: string; guardianName: string; dateOfBirth: string };
}) {
  const initials = student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden w-full">
      <div className="bg-[#1a3a6b] px-5 py-4">
        <p className="text-white font-bold text-sm tracking-wide">Student Profile</p>
      </div>
      <div className="px-5 py-10 flex flex-col items-center gap-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow">
          <span className="text-3xl font-bold text-gray-500 dark:text-gray-300">{initials}</span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">EPN &nbsp;<span className="font-bold text-gray-700 dark:text-gray-200">{student.rollNumber}</span></p>
          <p className="text-sm font-bold text-gray-800 dark:text-white mt-1">{student.name}</p>
        </div>
      </div>
      <div className="px-5 py-6 space-y-4 text-sm">
        {[
          { label: 'Academic Year', value: student.batch },
          { label: 'Department',    value: student.department },
          { label: 'Date of Birth', value: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : '—' },
          { label: 'Guardian',      value: student.guardianName || '—' },
          { label: 'Mobile No',     value: student.phone || '—' },
          { label: 'Email',         value: student.email || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-2">
            <span className="text-gray-400 text-xs w-28 flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-gray-800 dark:text-gray-200 text-xs font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function StudentFeesPage() {
  const { user } = useAuthStore();
  const { students, fees, updateFee } = useDataStore();
  const studentId = useStudentId();

  const student = students.find((s) => s.id === studentId);
  const myFees = fees.filter((f) => f.studentId === studentId);

  // Group fees by semester
  const semesters = [...new Set(myFees.map((f) => f.semester))].sort();

  // Selected terms (checkboxes)
  const [selectedSems, setSelectedSems] = useState<string[]>([semesters[0] ?? '']);
  const [view, setView] = useState<PageView>('fees');
  const [payMethod, setPayMethod] = useState<string>('credit');

  // Credit card form state
  const [cardName,   setCardName]   = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv,    setCardCvv]    = useState('');

  // Session-paid receipts
  const [paidReceipts, setPaidReceipts] = useState<Record<string, { txnId: string; method: string; html: string; paidOn: string }>>({});

  const studentInfo = student
    ? { name: student.name, rollNumber: student.rollNumber, department: student.department, batch: student.batch, email: student.email, phone: student.phone, guardianName: student.guardianName, dateOfBirth: student.dateOfBirth }
    : { name: user?.name ?? '', rollNumber: '—', department: '—', batch: '—', email: user?.email ?? '', phone: '—', guardianName: '—', dateOfBirth: '' };

  const selectedFees = myFees.filter((f) => selectedSems.includes(f.semester) && f.due > 0);
  const selectedTotal = selectedFees.reduce((a, f) => a + f.due, 0);

  const toggleSem = (sem: string) => {
    setSelectedSems((prev) =>
      prev.includes(sem) ? prev.filter((s) => s !== sem) : [...prev, sem]
    );
  };

  const toggleAll = () => {
    const dueSems = semesters.filter((s) => myFees.filter((f) => f.semester === s).some((f) => f.due > 0));
    setSelectedSems(selectedSems.length === dueSems.length ? [] : dueSems);
  };

  const handleProcess = () => {
    if (selectedFees.length === 0) return;
    setView('payment');
  };

  const handlePayNow = () => {
    if (!payMethod) return;
    setView('processing');
    const newTxn = 'TXN' + Date.now();
    const paidOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const methodLabel = PAYMENT_METHODS.find((m) => m.id === payMethod)?.label ?? payMethod;

    setTimeout(() => {
      selectedFees.forEach((f) => {
        updateFee(f.id, { paid: f.amount, due: 0, status: 'paid', paidDate: new Date().toISOString().slice(0, 10), transactionId: newTxn });
      });

      // Group by semester for receipts
      const semGroups = selectedSems.reduce<Record<string, FeeRecord[]>>((acc, sem) => {
        acc[sem] = selectedFees.filter((f) => f.semester === sem);
        return acc;
      }, {});

      const newReceipts: typeof paidReceipts = {};
      for (const [sem, semFees] of Object.entries(semGroups)) {
        if (semFees.length > 0) {
          const html = buildReceiptHTML(semFees, studentInfo, sem, methodLabel, newTxn, paidOn);
          newReceipts[sem] = { txnId: newTxn, method: methodLabel, html, paidOn };
        }
      }
      setPaidReceipts((prev) => ({ ...prev, ...newReceipts }));
      setView('success');
    }, 2000);
  };

  // Transaction history: fees that have been paid (have transactionId)
  const paidFees = myFees.filter((f) => f.transactionId && f.status === 'paid');
  const txnGroups = paidFees.reduce<Record<string, FeeRecord[]>>((acc, f) => {
    const key = f.transactionId!;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  if (!myFees.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Payment</h1>
        <div className="card p-10 text-center text-gray-400">No fee records found.</div>
      </div>
    );
  }

  return (
    <div className="flex gap-5 items-start">
      {/* ── Left: Student Profile ── */}
      <div className="w-80  flex-shrink-0 hidden lg:block">
        <StudentProfile student={studentInfo} />
      </div>

      {/* ── Right: Main Content ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">

          {/* ══ Fee Details View ══ */}
          {view === 'fees' && (
            <motion.div key="fees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 dark:text-white text-base">Fee Details</h2>
                <button
                  onClick={() => setView('history')}
                  className="flex items-center gap-1.5 text-[#1a3a6b] dark:text-[#1a3a6b] text-sm font-medium hover:underline hover:border-b hover:border-[#1a3a6b]"
                >
                  <History className="w-4 h-4" />
                  Transaction History
                </button>
              </div>

              {/* Session header */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Session</p>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                  Select All
                  <input
                    type="checkbox"
                    checked={selectedSems.length === semesters.filter((s) => myFees.filter((f) => f.semester === s).some((f) => f.due > 0)).length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 accent-[#1a3a6b]"
                  />
                </label>
              </div>

              {/* Terms */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {semesters.map((sem) => {
                  const semFees = myFees.filter((f) => f.semester === sem);
                  const semTotal = semFees.reduce((a, f) => a + f.amount, 0);
                  const hasDue = semFees.some((f) => f.due > 0);
                  const isSelected = selectedSems.includes(sem);
                  const dueDateStr = semFees[0]?.dueDate
                    ? new Date(semFees[0].dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '';

                  return (
                    <div key={sem}>
                      {/* Term row */}
                      <div className={`px-6 py-3 flex items-center justify-between ${isSelected ? 'bg-[#1a3a6b]/10 dark:bg-[#1a3a6b]/20' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{sem}</p>
                          {dueDateStr && (
                            <span className="text-xs text-orange-500 font-medium">[Due date {dueDateStr}]</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Amount &nbsp;
                            <span className="font-bold text-gray-800 dark:text-white">₹{semTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </span>
                          {hasDue ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSem(sem)}
                              className="w-4 h-4 rounded border-gray-300 accent-[#1a3a6b]"
                            />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      {/* Fee breakdown */}
                      <div className="px-6 py-2">
                        <div className="flex justify-between text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide py-2 border-b border-gray-100 dark:border-gray-800">
                          <span>Fee Type</span>
                          <span>Fee Amount</span>
                        </div>
                        {semFees.map((fee) => (
                          <div key={fee.id} className="flex justify-between py-2.5 text-sm border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                            <span className="text-gray-700 dark:text-gray-300">{fee.feeType}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {fee.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="text-right ml-auto flex items-center gap-8">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Amount</span>
                  <span className="text-base font-black text-[#1a3a6b] dark:text-[#1a3a6b]">
                    ₹{selectedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="px-6 pb-5 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSems([])}
                  className="px-8 py-2.5 rounded-lg border-2 border-[#1a3a6b] text-[#1a3a6b] dark:border-[#1a3a6b] dark:text-[#1a3a6b] font-semibold text-sm hover:bg-white hover:border-[#1a3a6b] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={selectedFees.length === 0}
                  className="px-8 py-2.5 rounded-lg bg-[#1a3a6b] text-white font-semibold text-sm hover:bg-white hover:text-[#1a3a6b] hover:border-[#1a3a6b] border border-transparent disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  Process
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ Payment View ══ */}
          {view === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

              <div className="flex flex-col lg:flex-row min-h-[480px]">
                {/* Left: Payment Methods */}
                <div className="lg:w-52 border-r border-gray-100 dark:border-gray-800 flex-shrink-0">
                  <div className="bg-[#1a3a6b] px-5 py-4">
                    <p className="text-white font-bold text-sm">Payment Methods</p>
                  </div>
                  <div className="py-2">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      const active = payMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPayMethod(m.id)}
                          className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${active ? 'bg-[#1a3a6b]/10 dark:bg-[#1a3a6b]/20 border-l-4 border-[#1a3a6b]' : 'border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:border-l-4 hover:border-[#1a3a6b]'}`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#1a3a6b] dark:text-[#1a3a6b]' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${active ? 'text-[#1a3a6b] dark:text-[#1a3a6b]' : 'text-gray-600 dark:text-gray-300'}`}>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Center: Form */}
                <div className="flex-1 px-8 py-6 border-r border-gray-100 dark:border-gray-800">
                  <h3 className="text-base font-bold text-[#1a3a6b] dark:text-[#1a3a6b] mb-6">
                    Pay By {PAYMENT_METHODS.find((m) => m.id === payMethod)?.label}
                  </h3>

                  {(payMethod === 'credit' || payMethod === 'debit') && (
                    <div className="space-y-5 max-w-md">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                          {payMethod === 'credit' ? 'Credit' : 'Debit'} Card Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder={`Enter ${payMethod} card name`}
                          className="w-full px-4 py-2.5 border-2 border-[#1a3a6b] dark:border-[#1a3a6b] rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-[#1a3a6b] dark:focus:border-[#1a3a6b] placeholder-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                          {payMethod === 'credit' ? 'Credit' : 'Debit'} Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          placeholder="Enter card number"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-[#1a3a6b] dark:focus:border-[#1a3a6b] placeholder-gray-300"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Expire Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-[#1a3a6b] dark:focus:border-[#1a3a6b] placeholder-gray-300"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">CVV/CVC</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-[#1a3a6b] dark:focus:border-[#1a3a6b] placeholder-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {payMethod === 'upi' && (
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">UPI ID</label>
                        <input
                          type="text"
                          placeholder="Enter UPI ID (e.g. name@upi)"
                          className="w-full px-4 py-2.5 border-2 border-[#1a3a6b] dark:border-[#1a3a6b] rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#1a3a6b] placeholder-gray-300"
                        />
                      </div>
                    </div>
                  )}

                  {payMethod === 'netbanking' && (
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Select Bank</label>
                        <select className="w-full px-4 py-2.5 border-2 border-[#1a3a6b] dark:border-[#1a3a6b] rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#1a3a6b]">
                          <option>State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                          <option>Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {payMethod === 'qr' && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-40 h-40 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <QrCode className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Scan QR code to pay</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-10 flex gap-4">
                    <button
                      onClick={handlePayNow}
                      className="flex-1 py-3 rounded-lg bg-[#1a3a6b] text-white font-bold text-sm hover:bg-white hover:text-[#1a3a6b] hover:border-[#1a3a6b] border border-transparent transition-colors"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => setView('fees')}
                      className="flex-1 py-3 rounded-lg border-2 border-[#1a3a6b] text-[#1a3a6b] dark:border-[#1a3a6b] dark:text-[#1a3a6b] font-bold text-sm hover:bg-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Right: Payment Details */}
                <div className="lg:w-56 flex-shrink-0 px-6 py-6">
                  <h3 className="text-base font-bold text-[#1a3a6b] dark:text-[#1a3a6b] mb-5">Payment Details</h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {selectedSems.map((sem) => {
                      const semFees = myFees.filter((f) => f.semester === sem && f.due > 0);
                      const semTotal = semFees.reduce((a, f) => a + f.due, 0);
                      if (!semFees.length) return null;
                      return (
                        <div key={sem} className="flex justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{sem}</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {semTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-sm">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Total Amount</span>
                      <span className="font-black text-[#1a3a6b] dark:text-[#1a3a6b]">
                        {selectedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ Processing View ══ */}
          {view === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center py-24 gap-5">
              <Loader2 className="w-14 h-14 text-[#1a3a6b] animate-spin" />
              <p className="text-base font-bold text-gray-800 dark:text-white">Processing Payment…</p>
              <p className="text-sm text-gray-400">Please do not close this window</p>
            </motion.div>
          )}

          {/* ══ Success View ══ */}
          {view === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

              <div className="bg-[#1a3a6b] px-6 py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <p className="text-white font-bold text-sm">Payment Successful</p>
              </div>

              <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">Payment Successful!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatCurrency(selectedTotal)} paid via {PAYMENT_METHODS.find((m) => m.id === payMethod)?.label}
                  </p>
                </div>

                {/* Receipt cards */}
                <div className="w-full max-w-md space-y-3 mt-2">
                  {selectedSems.map((sem) => {
                    const rec = paidReceipts[sem];
                    if (!rec) return null;
                    return (
                      <div key={sem} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{sem}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Successful</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Transaction ID</span>
                          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{rec.txnId}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Paid On</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{rec.paidOn}</span>
                        </div>
                        <button
                          onClick={() => triggerReceiptDownload(rec.html, `Receipt_${rec.txnId}_${sem.replace(/\s/g, '_')}.html`)}
                          className="flex items-center gap-1.5 text-xs text-[#1a3a6b] dark:text-[#1a3a6b] font-medium hover:underline hover:border-b hover:border-[#1a3a6b] mt-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Receipt
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setView('fees')}
                  className="mt-2 px-8 py-2.5 rounded-lg bg-[#1a3a6b] hover:bg-[#152d56] text-white font-semibold text-sm transition-colors"
                >
                  Back to Fee Details
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ Transaction History View ══ */}
          {view === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => setView('fees')}
                  className="flex items-center gap-1.5 text-[#1a3a6b] dark:text-[#1a3a6b] text-sm font-semibold hover:underline hover:border-b hover:border-[#1a3a6b]"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">View Transaction History</p>
              </div>

              {/* Transactions */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800 px-6 py-4 space-y-4">
                {Object.keys(txnGroups).length === 0 && (
                  <div className="py-12 text-center">
                    <User className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No transactions yet</p>
                  </div>
                )}
                {Object.entries(txnGroups).map(([txnId, txnFees]) => {
                  const isSuccess = txnFees.every((f) => f.status === 'paid');
                  const paidDate = txnFees[0]?.paidDate
                    ? new Date(txnFees[0].paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—';
                  const total = txnFees.reduce((a, f) => a + f.amount, 0);
                  const rec = Object.values(paidReceipts).find((r) => r.txnId === txnId);

                  return (
                    <div key={txnId} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      {/* Txn header */}
                      <div className="px-5 py-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">School Fee Payment</p>
                          <p className="text-xs text-[#1a3a6b] dark:text-[#1a3a6b] mt-0.5">{paidDate}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Transaction ID: {txnId}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-3 py-1 rounded ${isSuccess ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {isSuccess ? 'Successful' : 'Failed'}
                          </span>
                          {isSuccess && rec && (
                            <button
                              onClick={() => triggerReceiptDownload(rec.html, `Receipt_${txnId}.html`)}
                              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[#1a3a6b] dark:hover:text-[#1a3a6b] hover:underline transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </button>
                          )}
                          {!isSuccess && <XCircle className="w-4 h-4 text-red-400" />}
                        </div>
                      </div>

                      {/* Fee breakdown table */}
                      <div className="border-t border-gray-100 dark:border-gray-800">
                        <div className="grid grid-cols-4 px-5 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          <span>Fee Type</span>
                          <span className="text-right">Amount</span>
                          <span className="text-right">Late Fee</span>
                          <span className="text-right">Total Fee</span>
                        </div>
                        {txnFees.map((fee) => (
                          <div key={fee.id} className="grid grid-cols-4 px-5 py-3 text-sm border-t border-gray-50 dark:border-gray-800/50">
                            <span className="text-gray-700 dark:text-gray-300">{fee.semester} {fee.feeType}</span>
                            <span className="text-right text-gray-800 dark:text-gray-200">₹{fee.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            <span className="text-right text-gray-400">₹0.00</span>
                            <span className="text-right font-semibold text-gray-800 dark:text-gray-200">₹{fee.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                        <div className="grid grid-cols-4 px-5 py-3 text-sm border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 font-bold">
                          <span className="col-span-3 text-gray-600 dark:text-gray-300">Total</span>
                          <span className="text-right text-[#1a3a6b] dark:text-[#1a3a6b]">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
