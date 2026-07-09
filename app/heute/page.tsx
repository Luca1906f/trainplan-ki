import { TodayView } from '@/components/tryme/TodayView';
import { AccountBar } from '@/components/AccountBar';

// Per-User-Daten (Login-Session) — nicht statisch vorrendern.
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <>
      <AccountBar />
      <TodayView />
    </>
  );
}
