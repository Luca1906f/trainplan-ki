'use client';

interface Props {
  mealType: string;
  name: string;
  kcal: number;
  checked: boolean;
  onToggle: () => void;
}

export function MealCheckRow({ mealType, name, kcal, checked, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={`${mealType}: ${name} abhaken`}
      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
        checked ? 'bg-neutral-900 text-white' : ''
      }`}
    >
      <span>
        <span className="block text-xs uppercase tracking-wide opacity-60">{mealType}</span>
        <span className="font-medium">{name}</span>
      </span>
      <span className="flex items-center gap-3 text-sm">
        <span className="opacity-70">{kcal} kcal</span>
        <span aria-hidden>{checked ? '✓' : '○'}</span>
      </span>
    </button>
  );
}
