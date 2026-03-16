export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Page header skeleton */}
      <div className="h-8 w-48 skeleton-shimmer rounded-lg" />
      <div className="h-4 w-72 skeleton-shimmer rounded" />

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 gap-4 mt-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="h-4 w-3/4 skeleton-shimmer rounded" />
              <div className="h-5 w-16 skeleton-shimmer rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full skeleton-shimmer rounded" />
              <div className="h-3 w-5/6 skeleton-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
