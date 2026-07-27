import { TrainingPlanner } from '@/components/training/TrainingPlanner';

// Admin-Bereich — nicht statisch vorrendern.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <TrainingPlanner />;
}
