import { Bell, Zap, CreditCard, Wifi, Home } from "lucide-react";

interface ReminderCardProps {
  icon: string;
  merchant: string;
  amount: number;
  dueDate: string;
}

export function ReminderCard({ icon, merchant, amount, dueDate }: ReminderCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "zap":
        return <Zap className="w-5 h-5" />;
      case "card":
        return <CreditCard className="w-5 h-5" />;
      case "wifi":
        return <Wifi className="w-5 h-5" />;
      case "home":
        return <Home className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-xl p-5 hover:border-[var(--lumen-accent)]/50 transition-colors shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-black" style={{ background: "var(--lumen-accent)" }}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="mb-1">Pay your ${amount.toFixed(2)} {merchant} bill</p>
          <p className="text-sm text-muted-foreground">Due: {dueDate}</p>
        </div>
      </div>
    </div>
  );
}