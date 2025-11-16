interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ label, value, color = "bg-gray-100" }: StatCardProps) {
  return (
    <div className={`p-4 rounded-lg ${color} shadow-sm`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
