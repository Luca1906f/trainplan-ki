import { TodayView } from '@/components/tryme/TodayView';

// Per-User-Daten (Login-Session) — nicht statisch vorrendern.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <TodayView />;
}
