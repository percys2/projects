import { Suspense } from "react";
import SubscriptionSuccessContent from "./SubscriptionSuccessContent";

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center animate-pulse">
          <div className="w-20 h-20 bg-emerald-200 rounded-full mx-auto mb-6"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
