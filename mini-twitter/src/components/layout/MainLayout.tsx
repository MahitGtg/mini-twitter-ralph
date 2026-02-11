"use client";

import Sidebar from "@/components/layout/Sidebar";

type MainLayoutProps = {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
};

export default function MainLayout({ children, rightRail }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl gap-4 px-4 py-6 lg:gap-6">
        <div className="hidden w-64 shrink-0 lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 space-y-6">{children}</main>
        <aside className="hidden w-72 shrink-0 xl:block">
          {rightRail ? (
            rightRail
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              <p className="font-semibold text-slate-700">Tips</p>
              <p className="mt-2">
                Share your first update, follow people, and customize your
                profile.
              </p>
            </div>
          )}
        </aside>
      </div>
      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-slate-50/95 px-3 py-2 backdrop-blur lg:hidden">
        <Sidebar variant="mobile" />
      </div>
    </div>
  );
}
