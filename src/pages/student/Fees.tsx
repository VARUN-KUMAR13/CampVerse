import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard,
  Download,
  FileText,
  IndianRupee,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Calculator,
} from "lucide-react";

const StudentFees = () => {
  const { userData } = useAuth();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Mock fee data - replace with real data
  const feeData = {
    totalFees: 156385,
    paidFees: 156385,
    pendingFees: 0,
    completionPercentage: 100,
  };

  const feeStructure = {
    academic: [
      {
        headType: "Template",
        name: "B.Tech 2022 Batch Tuition Fee",
        totalAmount: 156385,
        balanceAmount: 0,
        color: "bg-blue-100",
      },
      {
        headType: "Fee",
        name: "Tuition Fee",
        totalAmount: 150000,
        balanceAmount: 0,
        color: "bg-green-100",
      },
      {
        headType: "Fee",
        name: "JNTUH Special Fee",
        totalAmount: 3385,
        balanceAmount: 0,
        color: "bg-purple-100",
      },
      {
        headType: "Fee",
        name: "Accreditation Fee",
        totalAmount: 3000,
        balanceAmount: 0,
        color: "bg-cyan-100",
      },
    ],
    hostel: [
      {
        headType: "Fee",
        name: "Hostel Fee (New)",
        totalAmount: 160000,
        balanceAmount: 0,
        color: "bg-orange-100",
      },
    ],
    transport: [
      {
        headType: "Fee",
        name: "Bus Fee",
        totalAmount: 25000,
        balanceAmount: 0,
        color: "bg-yellow-100",
      },
    ],
    other: [
      {
        headType: "Fee",
        name: "Library Fee",
        totalAmount: 5000,
        balanceAmount: 0,
        color: "bg-pink-100",
      },
    ],
  };

  const transactionHistory = [
    {
      orderId: "175332508494358409",
      transactionId: "pay_QwkCnrqaQFdPFG",
      amount: 60000,
      date: "24th Jul, 2025 08:14 AM",
      status: "Success",
      receiptNo: "ACF - 9965711",
    },
    {
      orderId: "175319930301858228",
      transactionId: "pay_QwAVmekS5JVsVs",
      amount: 46385,
      date: "22nd Jul, 2025 09:19 PM",
      status: "Success",
      receiptNo: "ACF - 9965683",
    },
    {
      orderId: "175319864018753344",
      transactionId: "pay_QwAIb62bCrmfGm",
      amount: 50000,
      date: "22nd Jul, 2025 09:07 PM",
      status: "Success",
      receiptNo: "ACF - 9965691",
    },
  ];

  const optionalFees = [
    { name: "ID CARD 300", amount: 300, color: "bg-pink-100" },
    { name: "ID CARD 100", amount: 100, color: "bg-yellow-100" },
    { name: "ID CARD 200", amount: 200, color: "bg-pink-100" },
    { name: "Hostel Fine Without Notice", amount: 500, color: "bg-yellow-100" },
    { name: "Duplicate Bus Pass", amount: 500, color: "bg-pink-100" },
    { name: "Temporary ID Card", amount: 50, color: "bg-yellow-100" },
    { name: "Mobile Fine", amount: 1000, color: "bg-pink-100" },
    { name: "Duplicate Hall Ticket", amount: 150, color: "bg-yellow-100" },
    { name: "MIDS Re-Registration", amount: 3000, color: "bg-pink-100" },
    { name: "Hostel Caution Deposit", amount: 10000, color: "bg-yellow-100" },
  ];

  const handlePayment = (amount: number) => {
    // Redirect to Razorpay - you'll provide the payment link later
    console.log(`Initiating payment for ₹${amount}`);
    // window.open('YOUR_RAZORPAY_PAYMENT_LINK', '_blank');
    alert(`Payment of ₹${amount} will be processed via Razorpay`);
  };

  const FeeProgressCircle = ({ percentage }: { percentage: number }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgb(226, 232, 240)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgb(139, 92, 246)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2023-24">2023-24</SelectItem>
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
                {/* Fee Overview Card */}
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
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Pending Fees</p>
                            <p className="text-2xl font-bold text-destructive">₹{feeData.pendingFees}/-</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
                      <p className="text-sm text-muted-foreground">View all payment records</p>
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

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Recent Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactionHistory.slice(0, 3).map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">₹{transaction.amount.toLocaleString()}/-</p>
                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                            <p className="text-xs text-muted-foreground">ID: {transaction.transactionId}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {transaction.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Receipt className="w-4 h-4 mr-2" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Academic Fees Tab */}
              <TabsContent value="academic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Fees - {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feeStructure.academic.map((fee, index) => (
                      <div key={index} className={`p-4 rounded-lg ${fee.color} border`}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2">{fee.headType}</Badge>
                            <h4 className="font-medium">{fee.name}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Balance Amount</p>
                            <p className="text-lg font-bold">₹{fee.balanceAmount}/-</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-semibold">₹{fee.totalAmount.toLocaleString()}/-</p>
                          </div>
                          {fee.balanceAmount > 0 && (
                            <Button 
                              onClick={() => handlePayment(fee.balanceAmount)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hostel Fees Tab */}
              <TabsContent value="hostel" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hostel Fees - {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feeStructure.hostel.map((fee, index) => (
                      <div key={index} className={`p-4 rounded-lg ${fee.color} border`}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2">{fee.headType}</Badge>
                            <h4 className="font-medium">{fee.name}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Balance Amount</p>
                            <p className="text-lg font-bold">₹{fee.balanceAmount}/-</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-semibold">₹{fee.totalAmount.toLocaleString()}/-</p>
                          </div>
                          {fee.balanceAmount > 0 && (
                            <Button 
                              onClick={() => handlePayment(fee.balanceAmount)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transport Fees Tab */}
              <TabsContent value="transport" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transport Fees - {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feeStructure.transport.map((fee, index) => (
                      <div key={index} className={`p-4 rounded-lg ${fee.color} border`}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2">{fee.headType}</Badge>
                            <h4 className="font-medium">{fee.name}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Balance Amount</p>
                            <p className="text-lg font-bold">₹{fee.balanceAmount}/-</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-semibold">₹{fee.totalAmount.toLocaleString()}/-</p>
                          </div>
                          {fee.balanceAmount > 0 && (
                            <Button 
                              onClick={() => handlePayment(fee.balanceAmount)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Optional Fees Tab */}
              <TabsContent value="optional" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Optional Fees</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Pay for additional services and requirements
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optionalFees.map((fee, index) => (
                        <div key={index} className={`p-4 rounded-lg ${fee.color} border cursor-pointer hover:shadow-md transition-shadow`}>
                          <div className="space-y-3">
                            <h4 className="font-medium">{fee.name}</h4>
                            <div className="flex justify-between items-center">
                              <p className="text-2xl font-bold">₹{fee.amount}/-</p>
                              <Button 
                                size="sm"
                                onClick={() => handlePayment(fee.amount)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Pay Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentFees;
