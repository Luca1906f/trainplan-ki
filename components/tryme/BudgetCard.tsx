import { budgetMessage, type DayBudget } from '@/lib/nutrition/budget';

export function BudgetCard({ budget }: { budget: DayBudget }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="font-medium">{budgetMessage(budget)}</p>
      {(budget.allChecked && budget.rest > 0) && (
        <p className="mt-1 text-xs text-neutral-400">
          Hochrechnung bei Regelmäßigkeit über eine Woche — kein Effekt eines einzelnen Tages.
        </p>
      )}
    </div>
  );
}
