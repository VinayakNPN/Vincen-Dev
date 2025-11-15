import { useState, useEffect } from "react";
import {
  Plus,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { UploadModal } from "./UploadModal";
import { ReminderCard } from "./ReminderCard";
import { InsightCard } from "./InsightCard";
import { SpendingCharts } from "./SpendingCharts";
import { ChatAssistant } from "./ChatAssistant";
import { ExtractedDocument, extractDocumentData } from "../utils/documentParser";

interface DashboardProps {
  onLogout: () => void;
}

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
}

interface Reminder {
  id: string;
  icon: string;
  merchant: string;
  amount: number;
  dueDate: string;
}

interface Insight {
  id: string;
  type: "warning" | "positive" | "neutral" | "sparkle";
  message: string;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] =
    useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<ExtractedDocument[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      icon: "zap",
      merchant: "Edison Electric",
      amount: 85.0,
      dueDate: "Nov 20th",
    },
    {
      id: "2",
      icon: "wifi",
      merchant: "Comcast Internet",
      amount: 79.99,
      dueDate: "Nov 22nd",
    },
    {
      id: "3",
      icon: "card",
      merchant: "Chase Credit Card",
      amount: 250.0,
      dueDate: "Nov 25th",
    },
  ]);

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: "1",
      type: "warning",
      message:
        "Heads Up: Your grocery spending is 20% higher than last month.",
    },
    {
      id: "2",
      type: "positive",
      message:
        "Great job! You've saved $150 on dining out this month.",
    },
    {
      id: "3",
      type: "neutral",
      message:
        "Your utility bills average $164/month over the last 3 months.",
    },
  ]);

  const [transactions, setTransactions] = useState<
    Transaction[]
  >([
    {
      id: "1",
      merchant: "Whole Foods",
      category: "Groceries",
      amount: 127.43,
      date: "Nov 12",
    },
    {
      id: "2",
      merchant: "Shell Gas Station",
      category: "Transportation",
      amount: 45.2,
      date: "Nov 11",
    },
    {
      id: "3",
      merchant: "Netflix",
      category: "Entertainment",
      amount: 15.99,
      date: "Nov 10",
    },
    {
      id: "4",
      merchant: "Starbucks",
      category: "Dining",
      amount: 6.75,
      date: "Nov 10",
    },
    {
      id: "5",
      merchant: "Target",
      category: "Shopping",
      amount: 89.32,
      date: "Nov 9",
    },
  ]);

  const [reminderScrollIndex, setReminderScrollIndex] =
    useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll reminders
  useEffect(() => {
    if (isPaused || reminders.length <= 1) return;

    const interval = setInterval(() => {
      setReminderScrollIndex((prevIndex) => {
        // Loop back to start when reaching the end
        if (prevIndex >= reminders.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 4000); // 4 seconds per reminder - gives time to read

    return () => clearInterval(interval);
  }, [isPaused, reminders.length]);

  const handleUpload = async (file: File) => {
    // Extract document data (simulated OCR/AI processing)
    const extractedDoc = await extractDocumentData(file);
    
    // Add to uploaded documents
    setUploadedDocuments([...uploadedDocuments, extractedDoc]);
    
    // Create transaction from extracted document
    const newTransaction: Transaction = {
      id: extractedDoc.id,
      merchant: extractedDoc.merchant,
      category: extractedDoc.items[0]?.category || "Uncategorized",
      amount: extractedDoc.total,
      date: extractedDoc.date,
    };

    const newInsight: Insight = {
      id: Date.now().toString(),
      type: "sparkle",
      message: `✨ Processed ${file.name}! Found ${extractedDoc.items.length} items from ${extractedDoc.merchant} totaling $${extractedDoc.total.toFixed(2)}. Ask the AI assistant for detailed analysis!`,
    };

    setTransactions([newTransaction, ...transactions]);
    setInsights([newInsight, ...insights]);
  };

  const handleSummarize = () => {
    const newInsight: Insight = {
      id: Date.now().toString(),
      type: "sparkle",
      message:
        "📊 This week you spent $284.69 across 8 transactions. Your top category was Groceries ($127.43). You're on track with your budget!",
    };
    setInsights([newInsight, ...insights]);
  };

  const scrollReminders = (direction: "left" | "right") => {
    setIsPaused(true); // Pause auto-scroll when user manually navigates

    if (direction === "left" && reminderScrollIndex > 0) {
      setReminderScrollIndex(reminderScrollIndex - 1);
    } else if (
      direction === "right" &&
      reminderScrollIndex < reminders.length - 1
    ) {
      setReminderScrollIndex(reminderScrollIndex + 1);
    }

    // Resume auto-scroll after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Non-sticky, scrolls with content */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--lumen-accent)" }}
            >
              <div className="w-5 h-5 rounded-md bg-black/20" />
            </div>
            <h1 className="text-2xl tracking-tight">LUMEN</h1>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Upload CTA */}
        <div className="flex justify-center">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="h-14 px-8 text-white hover:opacity-90 transition-opacity shadow-lg shadow-[var(--lumen-accent)]/20"
            style={{ background: "var(--lumen-accent)" }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Bills/Receipts
          </Button>
        </div>

        {/* Smart Reminders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2>Smart Reminders</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollReminders("left")}
                disabled={reminderScrollIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollReminders("right")}
                disabled={
                  reminderScrollIndex >= reminders.length - 1
                }
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex space-x-4 transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${reminderScrollIndex * 336}px)`,
              }}
            >
              {reminders.map((reminder) => (
                <ReminderCard key={reminder.id} {...reminder} />
              ))}
            </div>
          </div>
        </section>

        {/* Spending Visualizations */}
        <SpendingCharts transactions={transactions} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Insights */}
          <section className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2>AI Insights</h2>
            </div>
            <div className="space-y-3">
              {insights.map((insight) => (
                <InsightCard key={insight.id} {...insight} />
              ))}
            </div>

            {/* Generative Summary Button */}
            <div className="mt-6">
              <Button
                onClick={handleSummarize}
                variant="outline"
                className="w-full h-12 border-[var(--lumen-accent)]/30 hover:bg-[var(--lumen-accent)]/10"
              >
                <Sparkles
                  className="w-5 h-5 mr-2"
                  style={{ color: "var(--lumen-accent)" }}
                />
                Summarize My Week
              </Button>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2>Recent Transactions</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                        Merchant
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                        Category
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                        Date
                      </th>
                      <th className="text-right px-6 py-4 text-sm text-muted-foreground">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {transaction.merchant}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-secondary text-sm">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* AI Chat Assistant */}
      <ChatAssistant uploadedDocuments={uploadedDocuments} />
    </div>
  );
}