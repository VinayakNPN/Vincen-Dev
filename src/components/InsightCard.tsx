import { TrendingUp, TrendingDown, AlertCircle, Sparkles } from "lucide-react";

interface InsightCardProps {
  type: "warning" | "positive" | "neutral" | "sparkle";
  message: string;
}

export function InsightCard({ type, message }: InsightCardProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "positive":
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      case "neutral":
        return <TrendingUp className="w-5 h-5" style={{ color: "var(--lumen-accent)" }} />;
      case "sparkle":
        return <Sparkles className="w-5 h-5" style={{ color: "var(--lumen-accent)" }} />;
      default:
        return <Sparkles className="w-5 h-5" style={{ color: "var(--lumen-accent)" }} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "positive":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`rounded-xl p-4 border ${getBgColor()} shadow-sm`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}