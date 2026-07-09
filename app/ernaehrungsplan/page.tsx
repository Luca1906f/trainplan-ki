import { NutritionPlanner } from '@/components/nutrition/NutritionPlanner';
import { AccountBar } from '@/components/AccountBar';

// Speichert pro eingeloggtem User — nicht statisch vorrendern.
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <>
      <AccountBar />
      <NutritionPlanner />
    </>
  );
}
