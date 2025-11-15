import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
}

interface SpendingChartsProps {
  transactions: Transaction[];
}

export function SpendingCharts({ transactions }: SpendingChartsProps) {
  // Calculate category spending
  const categorySpending = transactions.reduce((acc, transaction) => {
    const existing = acc.find(item => item.category === transaction.category);
    if (existing) {
      existing.value += transaction.amount;
    } else {
      acc.push({ category: transaction.category, value: transaction.amount });
    }
    return acc;
  }, [] as { category: string; value: number }[]);

  // Sort by value for better visualization
  categorySpending.sort((a, b) => b.value - a.value);

  // Calculate daily spending trend
  const dailySpending = transactions.reduce((acc, transaction) => {
    const existing = acc.find(item => item.date === transaction.date);
    if (existing) {
      existing.amount += transaction.amount;
    } else {
      acc.push({ date: transaction.date, amount: transaction.amount });
    }
    return acc;
  }, [] as { date: string; amount: number }[]);

  // Sort by date
  dailySpending.sort((a, b) => {
    const dateA = new Date(a.date + ", 2024");
    const dateB = new Date(b.date + ", 2024");
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate total spending
  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Colors for charts - using cyan accent with complementary colors
  const COLORS = ['#00D9FF', '#00B8E6', '#0098CC', '#0078B3', '#005899', '#003D80'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm">
            {payload[0].name === "value" ? payload[0].payload.category : payload[0].name}
          </p>
          <p className="text-sm" style={{ color: "#00D9FF" }}>
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section>
      <div className="mb-4">
        <h2>Spending Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Total spending: ${totalSpending.toFixed(2)} across {transactions.length} transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown - Donut Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ category, value }) => `${category} $${value.toFixed(0)}`}
                labelLine={false}
              >
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Trend - Area Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Daily Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailySpending}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#999"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#999"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#00D9FF" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                name="Spending"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bars */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="mb-4">Top Spending Categories</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categorySpending} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#999" tickFormatter={(value) => `$${value}`} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} stroke="#999" width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#00D9FF" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
