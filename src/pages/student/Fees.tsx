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
  GraduationCap,
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
                <div className="space-y-6">
                  {/* Fee Summary Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-primary" />
                        Academic Fees Summary - {selectedYear}
                      </CardTitle>
                      <div className="text-2xl font-bold text-foreground">
                        ₹{feeStructure.academic.reduce((sum, fee) => sum + fee.totalAmount, 0).toLocaleString()}/-
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Fee Structure Cards */}
                  <div className="space-y-4">
                    {feeStructure.academic.map((fee, index) => (
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
                                <Badge variant="outline" className="mb-1">
                                  {fee.headType}
                                </Badge>
                                <h4 className="font-semibold text-lg">{fee.name}</h4>
                              </div>
                            </div>
                            {fee.balanceAmount === 0 && (
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
                              <p className="text-lg font-bold text-green-600">₹{(fee.totalAmount - fee.balanceAmount).toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Balance</p>
                              <p className="text-lg font-bold text-destructive">₹{fee.balanceAmount}</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Status</p>
                              <p className="text-lg font-bold text-primary">{fee.balanceAmount === 0 ? "Completed" : "Pending"}</p>
                            </div>
                          </div>

                          {fee.balanceAmount > 0 && (
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handlePayment(fee.balanceAmount)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay ₹{fee.balanceAmount.toLocaleString()}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Hostel Fees Tab */}
              <TabsContent value="hostel" className="space-y-6">
                <div className="space-y-6">
                  {/* Hostel Summary Card */}
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

                  {/* Hostel Fee Cards */}
                  <div className="space-y-4">
                    {feeStructure.hostel.map((fee, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {fee.headType}
                                </Badge>
                                <h4 className="font-semibold text-lg">{fee.name}</h4>
                                <p className="text-sm text-muted-foreground">Room & Board Charges</p>
                              </div>
                            </div>
                            {fee.balanceAmount === 0 && (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Fully Paid
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                              <p className="text-lg font-bold">₹{fee.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Paid Amount</p>
                              <p className="text-lg font-bold text-green-600">₹{(fee.totalAmount - fee.balanceAmount).toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Pending</p>
                              <p className="text-lg font-bold text-destructive">₹{fee.balanceAmount}</p>
                            </div>
                          </div>

                          {fee.balanceAmount > 0 && (
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handlePayment(fee.balanceAmount)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Hostel Fee ₹{fee.balanceAmount.toLocaleString()}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Transport Fees Tab */}
              <TabsContent value="transport" className="space-y-6">
                <div className="space-y-6">
                  {/* Transport Summary Card */}
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

                  {/* Transport Fee Cards */}
                  <div className="space-y-4">
                    {feeStructure.transport.map((fee, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  <path d="M3 4a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 14.846 4.632 16 6.414 16H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                                </svg>
                              </div>
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {fee.headType}
                                </Badge>
                                <h4 className="font-semibold text-lg">{fee.name}</h4>
                                <p className="text-sm text-muted-foreground">College Bus Service</p>
                              </div>
                            </div>
                            {fee.balanceAmount === 0 && (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Annual Fee</p>
                              <p className="text-lg font-bold">₹{fee.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Paid</p>
                              <p className="text-lg font-bold text-green-600">₹{(fee.totalAmount - fee.balanceAmount).toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Status</p>
                              <p className="text-lg font-bold text-primary">{fee.balanceAmount === 0 ? "Active" : "Pending"}</p>
                            </div>
                          </div>

                          <div className="bg-muted p-4 rounded-lg mb-4">
                            <h5 className="font-semibold mb-2">Transport Benefits</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Daily pickup and drop service</li>
                              <li>• Air-conditioned buses</li>
                              <li>• GPS tracking for safety</li>
                              <li>• Multiple route options</li>
                            </ul>
                          </div>

                          {fee.balanceAmount > 0 && (
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handlePayment(fee.balanceAmount)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Transport Fee ₹{fee.balanceAmount.toLocaleString()}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Optional Fees Tab */}
              <TabsContent value="optional" className="space-y-6">
                <div className="space-y-6">
                  {/* Optional Fees Header */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Optional Services</h3>
                          <p className="text-purple-700 dark:text-purple-200">Additional services and requirements</p>
                          <p className="text-sm text-purple-600 dark:text-purple-300">Pay only what you need</p>
                        </div>
                        <div className="p-4 bg-purple-500 rounded-full">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Optional Fees Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {optionalFees.map((fee, index) => {
                      const isHighAmount = fee.amount >= 1000;
                      const isMediumAmount = fee.amount >= 500 && fee.amount < 1000;

                      return (
                        <Card
                          key={index}
                          className={`
                            group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105
                            ${isHighAmount ? 'border-red-200 hover:border-red-400' :
                              isMediumAmount ? 'border-orange-200 hover:border-orange-400' :
                              'border-green-200 hover:border-green-400'}
                          `}
                        >
                          <CardContent className="p-0">
                            <div className={`
                              p-4 text-white
                              ${isHighAmount ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                                isMediumAmount ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                                'bg-gradient-to-br from-green-500 to-emerald-600'}
                            `}>
                              <div className="flex items-center justify-between">
                                <div className="p-2 bg-white/20 rounded-lg">
                                  {fee.name.includes('ID CARD') ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                    </svg>
                                  ) : fee.name.includes('Bus') ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    </svg>
                                  ) : fee.name.includes('Fine') ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.447.894L10 15.118l-4.553 1.776A1 1 0 014 16V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 2a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className={`
                                  px-3 py-1 rounded-full text-xs font-medium
                                  ${isHighAmount ? 'bg-red-600' :
                                    isMediumAmount ? 'bg-orange-600' :
                                    'bg-green-600'}
                                `}>
                                  {isHighAmount ? 'High' : isMediumAmount ? 'Medium' : 'Low'}
                                </div>
                              </div>
                            </div>

                            <div className="p-6 space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-1 group-hover:text-purple-600 transition-colors">
                                  {fee.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {fee.name.includes('ID CARD') ? 'Identity card services' :
                                   fee.name.includes('Fine') ? 'Penalty charges' :
                                   fee.name.includes('Bus') ? 'Transport services' :
                                   fee.name.includes('Hostel') ? 'Accommodation charges' :
                                   'Administrative services'}
                                </p>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    ₹{fee.amount}
                                  </p>
                                  <p className="text-xs text-muted-foreground">One-time payment</p>
                                </div>
                              </div>

                              <Button
                                onClick={() => handlePayment(fee.amount)}
                                className={`
                                  w-full text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105
                                  ${isHighAmount ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' :
                                    isMediumAmount ? 'bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700' :
                                    'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}
                                `}
                                size="lg"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Quick Info */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Payment Information</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                            <li>• All payments are processed securely through Razorpay</li>
                            <li>• Digital receipts will be sent to your registered email</li>
                            <li>• Optional fees are payable only when required</li>
                            <li>• Contact admin for any fee-related queries</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentFees;
