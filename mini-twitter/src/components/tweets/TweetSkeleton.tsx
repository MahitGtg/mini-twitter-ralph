export default function TweetSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
