import { Card, CardTitle } from "@/components/ui/Card";

const REFS = [
  { label: "Add Liquidity", code: "approve() → addLiquidity()", color: "text-emerald-400" },
  { label: "Swap A → B", code: "approve() → swapAforB()", color: "text-[#00d9ff]" },
  { label: "Swap B → A", code: "approve() → swapBforA()", color: "text-violet-400" },
  { label: "Preview", code: "getSwapPreview(amtIn, bool)", color: "text-amber-400" },
  { label: "Remove LP", code: "removeLiquidity(shares)", color: "text-red-400" },
  { label: "Pool Info", code: "getReserves() / getPrice()", color: "text-gray-400" },
];

export function QuickRef() {
  return (
    <Card className="p-6">
      <CardTitle>📋 Quick Reference</CardTitle>
      <div className="divide-y divide-border">
        {REFS.map(({ label, code, color }) => (
          <div key={label} className="flex justify-between items-center py-2.5">
            <span className="font-mono text-[0.68rem] text-gray-500">{label}</span>
            <span className={`font-mono text-[0.65rem] font-bold ${color}`}>{code}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
