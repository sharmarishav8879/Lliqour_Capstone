import RecentlyViewed from "@/components/RecentlyViewed";

export default async function RecentlyViewedPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recently Viewed Products</h1>
      <RecentlyViewed />
    </main>
  );
}
