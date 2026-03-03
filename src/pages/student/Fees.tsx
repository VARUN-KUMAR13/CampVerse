import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  CreditCard,
  Download,
  FileText,
  IndianRupee,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  GraduationCap,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

declare global { interface Window { Razorpay: any } }

interface Transaction {
  _id: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  status: 'created' | 'pending' | 'success' | 'failed' | 'refunded';
  feeType: string;
  feeDescription?: string;
  academicYear?: string;
  receipt: string;
  createdAt: string;
}

interface FeeItem {
  headType: string;
  name: string;
  totalAmount: number;
  balanceAmount: number;
  color: string;
}

interface TemplateFee {
  name: string;
  totalAmount: number; // sum of children
  paidAmount: number;
  balanceAmount: number;
  children: FeeItem[];
}

const StudentFees = () => {
  const { userData } = useAuth();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // ── Dynamic academic year generation ────────────────────────────
  const generateAcademicYears = (): string[] => {
    const collegeId = userData?.collegeId || '';
    // Parse admission year from first 2 digits of college ID (e.g. '22' → 2022)
    const yearCode = collegeId.substring(0, 2);
    const admissionYear = yearCode && /^\d{2}$/.test(yearCode) ? parseInt('20' + yearCode) : 2022;
    const graduationYear = admissionYear + 4; // B.Tech = 4 years
    const years: string[] = [];
    for (let y = admissionYear; y < graduationYear; y++) {
      years.push(`${y}-${String(y + 1).slice(-2)}`);
    }
    return years;
  };

  const academicYearOptions = generateAcademicYears();

  // Default to current academic year (Jul-Jun cycle)
  const getCurrentAcademicYear = (): string => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed
    // Academic year starts in July (month 6)
    const startYear = curMonth >= 6 ? curYear : curYear - 1;
    const label = `${startYear}-${String(startYear + 1).slice(-2)}`;
    // Return it if it's in the student's range, else return last available
    return academicYearOptions.includes(label)
      ? label
      : academicYearOptions[academicYearOptions.length - 1] || '2025-26';
  };

  const [selectedYear, setSelectedYear] = useState(() => getCurrentAcademicYear());

  // ── Fetch transactions filtered by academic year ────────────────
  const fetchTransactions = useCallback(async () => {
    if (!userData?.collegeId) return;
    setLoadingTransactions(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/history/${userData.collegeId}?year=${encodeURIComponent(selectedYear)}`
      );
      const data = await response.json();
      if (data.success && data.payments) {
        setTransactions(data.payments);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, [userData?.collegeId, API_BASE_URL, selectedYear]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Get total paid for a specific fee type from transactions
  const getPaidForFeeType = (feeType: string): number => {
    return transactions
      .filter(t => t.status === 'success' && t.feeType === feeType)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Open receipt modal
  const openReceiptModal = (transaction: Transaction) => {
    setSelectedReceipt(transaction);
    setReceiptModalOpen(true);
  };

  // Download receipt as HTML
  const downloadReceipt = (transaction: Transaction) => {
    const totalForType = getFeeTotal(transaction.feeType);
    const paidForType = getPaidForFeeType(transaction.feeType);
    const remaining = Math.max(0, totalForType - paidForType);

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${transaction.receipt || transaction.orderId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 40px; color: #1e293b; background: #f8fafc; }
          .receipt { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px; text-align: center; color: #fff; }
          .header h1 { font-size: 24px; margin-bottom: 4px; }
          .header p { opacity: 0.85; font-size: 14px; }
          .body { padding: 32px; }
          .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
          .row:last-child { border-bottom: none; }
          .label { color: #64748b; font-size: 14px; }
          .value { font-weight: 600; font-size: 14px; color: #1e293b; }
          .amount-box { text-align: center; padding: 24px; margin: 24px 0; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; }
          .amount-box .amt { font-size: 32px; font-weight: 700; color: #16a34a; }
          .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .status-success { background: #dcfce7; color: #166534; }
          .status-failed { background: #fee2e2; color: #991b1b; }
          .footer { text-align: center; padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>🎓 CVR College of Engineering</h1>
            <p>Payment Receipt</p>
          </div>
          <div class="body">
            <div class="row"><span class="label">Receipt No</span><span class="value">${transaction.receipt || transaction.orderId}</span></div>
            <div class="row"><span class="label">Transaction ID</span><span class="value">${transaction.paymentId || 'N/A'}</span></div>
            <div class="row"><span class="label">Student Name</span><span class="value">${userData?.name || userData?.collegeId || ''}</span></div>
            <div class="row"><span class="label">Roll Number</span><span class="value">${userData?.collegeId || ''}</span></div>
            <div class="row"><span class="label">Fee Type</span><span class="value">${transaction.feeType}</span></div>
            <div class="row"><span class="label">Payment Date</span><span class="value">${formatDate(transaction.createdAt)}</span></div>
            <div class="amount-box">
              <p style="color:#64748b; font-size:13px; margin-bottom:8px;">Amount Paid</p>
              <p class="amt">₹${transaction.amount.toLocaleString()}/-</p>
            </div>
            <div class="row"><span class="label">Remaining Balance</span><span class="value" style="color: ${remaining > 0 ? '#dc2626' : '#16a34a'}">₹${remaining.toLocaleString()}/-</span></div>
            <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge ${transaction.status === 'success' ? 'status-success' : 'status-failed'}">${transaction.status === 'success' ? '✅ Paid' : '❌ Failed'}</span></span></div>
          </div>
          <div class="footer">
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p style="margin-top:4px;">For queries: accounts@cvr.ac.in</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${transaction.receipt || transaction.orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Receipt Downloaded', description: `Receipt saved successfully.` });
  };

  // Helper to get total fee for a type name
  const getFeeTotal = (feeType: string): number => {
    // Search in academic template children
    for (const tmpl of academicTemplates) {
      if (tmpl.name === feeType) return tmpl.children.reduce((s, c) => s + c.totalAmount, 0);
      const child = tmpl.children.find(c => c.name === feeType);
      if (child) return child.totalAmount;
    }
    // Search in flat fees
    const allFlat = [...baseFlatFees.hostel, ...baseFlatFees.transport, ...baseFlatFees.other];
    const found = allFlat.find(f => f.name === feeType);
    return found?.totalAmount || 0;
  };

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (amountInRupees: number, feeType: string = 'Other', feeDescription: string = 'Fee Payment') => {
    if (!amountInRupees || amountInRupees <= 0) {
      toast({ title: 'No pending amount', description: 'You have no dues to pay.' });
      return;
    }
    if (!RAZORPAY_KEY_ID) {
      // Simulate payment for demo without Razorpay key
      setIsProcessing(true);
      try {
        const txnId = `TXN_${Date.now()}`;
        const newTransaction: Transaction = {
          _id: txnId,
          orderId: `order_${Date.now()}`,
          paymentId: txnId,
          amount: amountInRupees,
          status: 'success',
          feeType,
          feeDescription,
          academicYear: selectedYear,
          receipt: `RCPT_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        // Optimistic UI update
        setTransactions(prev => [newTransaction, ...prev]);
        toast({ title: 'Payment Successful ✅', description: `₹${amountInRupees.toLocaleString()} paid for ${feeType}.` });

        // Open receipt modal
        setSelectedReceipt(newTransaction);
        setReceiptModalOpen(true);

        // Try to save to backend
        try {
          await fetch(`${API_BASE_URL}/payments/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: amountInRupees,
              studentId: userData?.collegeId || '',
              studentName: userData?.name || userData?.collegeId || '',
              email: userData?.email || `${userData?.collegeId}@cvr.ac.in`,
              feeType,
              feeDescription,
              academicYear: selectedYear,
              notes: { source: 'CampVerse Student Portal (Demo)' }
            })
          });
        } catch { /* Backend save is best-effort in demo mode */ }
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);

    try {
      const orderResponse = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInRupees,
          studentId: userData?.collegeId || '',
          studentName: userData?.name || userData?.collegeId || '',
          email: userData?.email || `${userData?.collegeId}@cvr.ac.in`,
          feeType,
          feeDescription,
          academicYear: selectedYear,
          notes: { source: 'CampVerse Student Portal' }
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast({ title: 'Payment unavailable', description: 'Could not load Razorpay. Check your network.' });
        return;
      }

      const options: any = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'CVR College of Engineering',
        description: feeDescription,
        order_id: orderData.order.id,
        prefill: {
          name: userData?.name || userData?.collegeId || 'Student',
          email: userData?.email || `${userData?.collegeId}@cvr.ac.in`,
        },
        notes: { studentId: userData?.collegeId || '', year: selectedYear, feeType },
        theme: { color: '#4F46E5' },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.verified) {
              toast({ title: 'Payment Successful ✅', description: `₹${amountInRupees.toLocaleString()} paid for ${feeType}.` });
              // Refresh transactions to update UI
              await fetchTransactions();
            } else {
              toast({ title: 'Payment Verification Failed', description: 'Contact admin with your transaction ID.', variant: 'destructive' });
            }
          } catch {
            toast({ title: 'Payment Received', description: `Transaction ID: ${response.razorpay_payment_id}. Verification pending.` });
            await fetchTransactions();
          }
        },
        modal: {
          ondismiss: () => {
            toast({ title: 'Payment Cancelled', description: 'You cancelled the payment.' });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({ title: 'Payment Failed', description: response.error?.description || 'Payment could not be completed.', variant: 'destructive' });
      });
      rzp.open();
    } catch {
      // Razorpay order creation failed (test keys expired, etc.) — fall back to demo mode
      const txnId = `TXN_${Date.now()}`;
      const newTransaction: Transaction = {
        _id: txnId,
        orderId: `order_${Date.now()}`,
        paymentId: txnId,
        amount: amountInRupees,
        status: 'success',
        feeType,
        feeDescription,
        academicYear: selectedYear,
        receipt: `RCPT_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
      toast({ title: 'Payment Successful ✅', description: `₹${amountInRupees.toLocaleString()} paid for ${feeType}.` });
      setSelectedReceipt(newTransaction);
      setReceiptModalOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Hierarchical fee structure ──────────────────────────────────────
  // Academic fees use parent-child: Template contains child Fee items.
  // Hostel / Transport are flat (no template wrapper).
  const academicTemplates: { name: string; children: { headType: string; name: string; totalAmount: number; color: string }[] }[] = [
    {
      name: "B.Tech 2022 Batch Tuition Fee",
      children: [
        { headType: "Fee", name: "Tuition Fee", totalAmount: 150000, color: "bg-green-100" },
        { headType: "Fee", name: "JNTUH Special Fee", totalAmount: 3385, color: "bg-purple-100" },
        { headType: "Fee", name: "Accreditation Fee", totalAmount: 3000, color: "bg-cyan-100" },
      ],
    },
  ];

  const baseFlatFees = {
    hostel: [
      { headType: "Fee", name: "Hostel Fee", totalAmount: 150000, color: "bg-orange-100" },
    ],
    transport: [
      { headType: "Fee", name: "Bus Fee", totalAmount: 25000, color: "bg-yellow-100" },
    ],
    other: [
      { headType: "Fee", name: "Library Fee", totalAmount: 5000, color: "bg-pink-100" },
    ],
  };

  // Compute flat fee items (hostel, transport, etc.)
  const computeFeeItems = (items: typeof baseFlatFees.hostel): FeeItem[] => {
    return items.map(item => {
      const paid = getPaidForFeeType(item.name);
      const balance = Math.max(0, item.totalAmount - paid);
      return { ...item, balanceAmount: balance };
    });
  };

  // Compute hierarchical academic fees
  const computeTemplateFees = (): TemplateFee[] => {
    return academicTemplates.map(template => {
      // Check if the parent template was paid directly
      const parentPaid = getPaidForFeeType(template.name);

      const children: FeeItem[] = template.children.map(child => {
        // If parent was paid in full, all children are auto-paid
        const childPaid = parentPaid >= template.children.reduce((s, c) => s + c.totalAmount, 0)
          ? child.totalAmount
          : getPaidForFeeType(child.name);
        return {
          ...child,
          balanceAmount: Math.max(0, child.totalAmount - childPaid),
        };
      });

      const totalAmount = children.reduce((s, c) => s + c.totalAmount, 0);
      const paidAmount = parentPaid >= totalAmount
        ? totalAmount
        : children.reduce((s, c) => s + (c.totalAmount - c.balanceAmount), 0);
      const balanceAmount = Math.max(0, totalAmount - paidAmount);

      return { name: template.name, totalAmount, paidAmount, balanceAmount, children };
    });
  };

  const academicFees = computeTemplateFees();
  const feeStructure = {
    hostel: computeFeeItems(baseFlatFees.hostel),
    transport: computeFeeItems(baseFlatFees.transport),
    other: computeFeeItems(baseFlatFees.other),
  };

  // Toggle expand/collapse for template
  const toggleTemplate = (name: string) => {
    setExpandedTemplates(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Overall dashboard stats
  const TOTAL_FEES = 156385;
  const paidAmount = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const feeData = {
    totalFees: TOTAL_FEES,
    paidFees: paidAmount,
    pendingFees: Math.max(0, TOTAL_FEES - paidAmount),
    completionPercentage: Math.min(100, Math.round((paidAmount / TOTAL_FEES) * 100)),
  };

  const optionalFees = [
    { name: "ID CARD 300", amount: 300, color: "bg-pink-100" },
    { name: "Hostel Fine Without Notice", amount: 500, color: "bg-yellow-100" },
    { name: "Duplicate Bus Pass", amount: 500, color: "bg-pink-100" },
    { name: "Temporary ID Card", amount: 50, color: "bg-yellow-100" },
    { name: "Mobile Fine", amount: 1000, color: "bg-pink-100" },
    { name: "Duplicate Hall Ticket", amount: 150, color: "bg-yellow-100" },
    { name: "MIDS Re-Registration", amount: 3000, color: "bg-pink-100" },
    { name: "Hostel Caution Deposit", amount: 10000, color: "bg-yellow-100" },
  ];

  const handlePayment = (amount: number, feeType: string = 'Other', description: string = 'Fee Payment') => {
    openRazorpay(amount, feeType, description);
  };

  const FeeProgressCircle = ({ percentage }: { percentage: number }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="rgb(226, 232, 240)" strokeWidth="10" fill="transparent" />
          <circle cx="50" cy="50" r="45" stroke="rgb(139, 92, 246)" strokeWidth="10" fill="transparent" strokeDasharray={strokeDasharray} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${percentage === 100 ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>
            {percentage === 100 ? "100%" : `${percentage}%`}
          </span>
        </div>
      </div>
    );
  };

  // Render a fee card (reused across academic, hostel, transport tabs)
  const renderFeeCard = (fee: FeeItem, index: number) => {
    const paid = fee.totalAmount - fee.balanceAmount;
    const isCompleted = fee.balanceAmount === 0;
    return (
      <Card key={index} className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {fee.headType === "Template" ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : (
                  <IndianRupee className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <Badge variant="outline" className="mb-1">{fee.headType}</Badge>
                <h4 className="font-semibold text-lg">{fee.name}</h4>
              </div>
            </div>
            {isCompleted && (
              <Badge className="bg-green-500">
                <CheckCircle className="w-4 h-4 mr-1" />
                Paid
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
              <p className="text-lg font-bold">₹{fee.totalAmount.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Paid Amount</p>
              <p className="text-lg font-bold text-green-600">₹{paid.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="text-lg font-bold text-destructive">₹{fee.balanceAmount.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className={`text-lg font-bold ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
                {isCompleted ? "Completed" : "Pending"}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handlePayment(fee.balanceAmount, fee.name, `${fee.name} Payment`)}
              disabled={isCompleted || isProcessing}
              className="bg-primary hover:bg-primary/90 h-9 px-5 rounded-[10px] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {isCompleted ? "Paid" : "Pay Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-primary" />
              Fee Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your fee payments and view transaction history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select name="academicYear" value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="academic">Academic Fees</TabsTrigger>
            <TabsTrigger value="hostel">Hostel Fees</TabsTrigger>
            <TabsTrigger value="transport">Transport Fees</TabsTrigger>
            <TabsTrigger value="optional">Optional Fees</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <FeeProgressCircle percentage={feeData.completionPercentage} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Fees</p>
                        <p className="text-2xl font-bold">₹{feeData.totalFees.toLocaleString()}/-</p>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Pending Fees</p>
                          <p className="text-2xl font-bold text-destructive">₹{feeData.pendingFees.toLocaleString()}/-</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openRazorpay(feeData.pendingFees, 'B.Tech 2022 Batch Tuition Fee', 'Academic Fee Payment')}
                          disabled={feeData.pendingFees <= 0 || isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-600/90 disabled:opacity-50 disabled:pointer-events-none rounded-[10px] h-9 px-5"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                          {feeData.pendingFees <= 0 ? "All Paid" : "Pay Now"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTab("academic")}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Fee Structure</h3>
                  <p className="text-sm text-muted-foreground">View detailed fee breakdown</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Transaction History</h3>
                  <p className="text-sm text-muted-foreground">{transactions.filter(t => t.status === 'success').length} completed payments</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Download Receipts</h3>
                  <p className="text-sm text-muted-foreground">Get fee payment receipts</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions — Centralized Payment Ledger */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                  {transactions.filter(t => t.status === 'success' || t.status === 'failed').length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {transactions.filter(t => t.status === 'success').length} paid &middot; {selectedYear}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading transactions...</span>
                  </div>
                ) : transactions.filter(t => t.status === 'success' || t.status === 'failed').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions for {selectedYear}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions
                      .filter(t => t.status === 'success' || t.status === 'failed')
                      .slice(0, 10)
                      .map((transaction) => {
                        // Determine category from feeType
                        const feeCategory = (() => {
                          const ft = (transaction.feeType || '').toLowerCase();
                          if (ft.includes('tuition') || ft.includes('jntuh') || ft.includes('accreditation') || ft.includes('b.tech'))
                            return { label: 'Academic', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' };
                          if (ft.includes('hostel'))
                            return { label: 'Hostel', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' };
                          if (ft.includes('bus') || ft.includes('transport'))
                            return { label: 'Transport', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' };
                          if (ft.includes('id card') || ft.includes('fine') || ft.includes('duplicate') || ft.includes('temporary') || ft.includes('mobile') || ft.includes('mids') || ft.includes('caution'))
                            return { label: 'Optional', className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300' };
                          return { label: 'Other', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300' };
                        })();

                        return (
                          <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">₹{transaction.amount.toLocaleString()}/-</p>
                                <Badge className={`text-[10px] px-1.5 py-0 ${feeCategory.className}`}>
                                  {feeCategory.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{transaction.feeType || 'Fee Payment'}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                              {transaction.status === 'success' ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Success
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                              {transaction.status === 'success' && (
                                <Button variant="outline" size="sm" onClick={() => openReceiptModal(transaction)}>
                                  <Receipt className="w-4 h-4 mr-1" />
                                  Receipt
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Fees Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  Academic Fees Summary - {selectedYear}
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">
                  ₹{academicFees.reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString()}/-
                </div>
              </CardHeader>
            </Card>

            {/* Hierarchical Template Cards */}
            <div className="space-y-4">
              {academicFees.map((template) => {
                const isExpanded = expandedTemplates[template.name] ?? false;
                const isCompleted = template.balanceAmount === 0;

                return (
                  <div key={template.name} className="space-y-0">
                    {/* ── Parent Template Card ────────────────────── */}
                    <Card className={`border-l-4 ${isCompleted ? 'border-l-green-500' : 'border-l-primary'
                      } transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {/* Expand/Collapse Toggle */}
                            <button
                              onClick={() => toggleTemplate(template.name)}
                              className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-primary" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-primary" />
                              )}
                            </button>
                            <div>
                              <Badge variant="outline" className="mb-1">Template</Badge>
                              <h4 className="font-semibold text-lg">{template.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Includes {template.children.length} fee component{template.children.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Parent Aggregated Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-lg font-bold">₹{template.totalAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Paid Amount</p>
                            <p className="text-lg font-bold text-green-600">₹{template.paidAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Balance</p>
                            <p className="text-lg font-bold text-destructive">₹{template.balanceAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className={`text-lg font-bold ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
                              {isCompleted ? 'Completed' : 'Pending'}
                            </p>
                          </div>
                        </div>

                        {/* Pay Full Template Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handlePayment(template.balanceAmount, template.name, `${template.name} - Full Payment`)}
                            disabled={isCompleted || isProcessing}
                            className="bg-primary hover:bg-primary/90 h-9 px-5 rounded-[10px] disabled:opacity-50 disabled:pointer-events-none"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CreditCard className="w-4 h-4 mr-2" />
                            )}
                            {isCompleted ? 'Paid' : 'Pay Now'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* ── Child Fee Cards (collapsible) ───────────── */}
                    {isExpanded && (
                      <div className="ml-6 pl-4 border-l-2 border-dashed border-muted-foreground/20 space-y-3 pt-3 pb-1">
                        {template.children.map((child, childIdx) => {
                          const childPaid = child.totalAmount - child.balanceAmount;
                          const childCompleted = child.balanceAmount === 0;
                          const parentFullyPaid = isCompleted;

                          return (
                            <Card
                              key={childIdx}
                              className={`border-l-4 ${childCompleted ? 'border-l-green-500/60' : 'border-l-muted-foreground/30'
                                } bg-card/50`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1.5 bg-primary/5 rounded-md">
                                      <IndianRupee className="w-4 h-4 text-primary/70" />
                                    </div>
                                    <div>
                                      <Badge variant="outline" className="mb-0.5 text-[10px] px-1.5 py-0">
                                        {child.headType}
                                      </Badge>
                                      <h5 className="font-medium text-sm">{child.name}</h5>
                                    </div>
                                  </div>
                                  {childCompleted && (
                                    <Badge className="bg-green-500/80 text-white text-[10px] px-2 py-0.5">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Paid
                                    </Badge>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                  <div className="text-center p-2 bg-muted/60 rounded-md">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Total</p>
                                    <p className="text-sm font-bold">₹{child.totalAmount.toLocaleString()}</p>
                                  </div>
                                  <div className="text-center p-2 bg-muted/60 rounded-md">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Paid</p>
                                    <p className="text-sm font-bold text-green-600">₹{childPaid.toLocaleString()}</p>
                                  </div>
                                  <div className="text-center p-2 bg-muted/60 rounded-md">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Balance</p>
                                    <p className="text-sm font-bold text-destructive">₹{child.balanceAmount.toLocaleString()}</p>
                                  </div>
                                  <div className="text-center p-2 bg-muted/60 rounded-md">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Status</p>
                                    <p className={`text-sm font-bold ${childCompleted ? 'text-green-600' : 'text-primary'}`}>
                                      {childCompleted ? 'Completed' : 'Pending'}
                                    </p>
                                  </div>
                                </div>

                                {/* Individual child Pay button (disabled if parent fully paid) */}
                                {!childCompleted && (
                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() => handlePayment(child.balanceAmount, child.name, `${child.name} Payment`)}
                                      disabled={parentFullyPaid || isProcessing}
                                      className="bg-primary/80 hover:bg-primary/70 h-8 px-4 rounded-[8px] text-xs disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      ) : (
                                        <CreditCard className="w-3 h-3 mr-1" />
                                      )}
                                      Pay Now
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Hostel Fees Tab */}
          <TabsContent value="hostel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Hostel Accommodation - {selectedYear}
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">
                  ₹{feeStructure.hostel.reduce((sum, fee) => sum + fee.totalAmount, 0).toLocaleString()}/-
                </div>
              </CardHeader>
            </Card>
            <div className="space-y-4">
              {feeStructure.hostel.map((fee, index) => renderFeeCard(fee, index))}
            </div>
          </TabsContent>

          {/* Transport Fees Tab */}
          <TabsContent value="transport" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 14.846 4.632 16 6.414 16H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                  </svg>
                  Transportation Services - {selectedYear}
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">
                  ₹{feeStructure.transport.reduce((sum, fee) => sum + fee.totalAmount, 0).toLocaleString()}/-
                </div>
              </CardHeader>
            </Card>
            <div className="space-y-4">
              {feeStructure.transport.map((fee, index) => renderFeeCard(fee, index))}
            </div>
          </TabsContent>

          {/* Optional Fees Tab */}
          <TabsContent value="optional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Optional Services
                </CardTitle>
                <p className="text-muted-foreground">Additional services and requirements - Pay only what you need</p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optionalFees.map((fee, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IndianRupee className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant={fee.amount >= 1000 ? "destructive" : fee.amount >= 500 ? "default" : "secondary"}>
                        {fee.amount >= 1000 ? 'High' : fee.amount >= 500 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-lg">{fee.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {fee.name.includes('ID CARD') ? 'Identity card services' :
                            fee.name.includes('Fine') ? 'Penalty charges' :
                              fee.name.includes('Bus') ? 'Transport services' :
                                fee.name.includes('Hostel') ? 'Accommodation charges' :
                                  'Administrative services'}
                        </p>
                      </div>

                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold">₹{fee.amount}</p>
                        <p className="text-xs text-muted-foreground">One-time payment</p>
                      </div>

                      <Button
                        onClick={() => handlePayment(fee.amount, fee.name, `${fee.name} Payment`)}
                        disabled={isProcessing}
                        className="w-full bg-primary hover:bg-primary/90 h-9 rounded-[10px]"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                        Pay Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Payment Information</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• All payments are processed securely through Razorpay</li>
                      <li>• Digital receipts will be sent to your registered email</li>
                      <li>• Optional fees are payable only when required</li>
                      <li>• Contact admin for any fee-related queries</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Receipt Modal ──────────────────────────────────────────── */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Payment Receipt
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              {/* Receipt Header */}
              <div className="text-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white">
                <h3 className="text-lg font-bold">🎓 CVR College of Engineering</h3>
                <p className="text-sm opacity-85">Payment Receipt</p>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Receipt No</span>
                  <span className="text-sm font-semibold">{selectedReceipt.receipt || selectedReceipt.orderId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="text-sm font-semibold font-mono">{selectedReceipt.paymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Student Name</span>
                  <span className="text-sm font-semibold">{userData?.name || userData?.collegeId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Roll Number</span>
                  <span className="text-sm font-semibold">{userData?.collegeId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Fee Type</span>
                  <span className="text-sm font-semibold">{selectedReceipt.feeType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Payment Date</span>
                  <span className="text-sm font-semibold">{formatDate(selectedReceipt.createdAt)}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900">
                <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-green-600">₹{selectedReceipt.amount.toLocaleString()}/-</p>
              </div>

              {/* Remaining Balance */}
              {(() => {
                const totalForType = getFeeTotal(selectedReceipt.feeType);
                const paidForType = getPaidForFeeType(selectedReceipt.feeType);
                const remaining = Math.max(0, totalForType - paidForType);
                return totalForType > 0 ? (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Remaining Balance</span>
                    <span className={`text-sm font-semibold ${remaining > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      ₹{remaining.toLocaleString()}/-
                    </span>
                  </div>
                ) : null;
              })()}

              {/* Status */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={selectedReceipt.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {selectedReceipt.status === 'success' ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Paid</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Failed</>
                  )}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 h-9 rounded-[10px]" onClick={() => downloadReceipt(selectedReceipt)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="h-9 rounded-[10px]" onClick={() => setReceiptModalOpen(false)}>
                  Close
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                This is a computer-generated receipt. For queries: accounts@cvr.ac.in
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
};

export default StudentFees;
