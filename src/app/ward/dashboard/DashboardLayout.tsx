import ActionButtons from "./ActionButtons";
import AlertsPanel from "./AlertsPanel";
import Header from "./Header";
import RecentActivity from "./RecentActivity";
import SearchCitizen from "./SearchCitizen";
import StatsCards from "./StatsCards";

export default function DashboardLayout() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-287.5 px-4 pt-12 sm:px-6 md:px-8">
        <Header />

        <div className="mt-8">
          <ActionButtons />
        </div>

        <div className="mt-8">
          <StatsCards />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-9.5 lg:grid-cols-[65%_35%]">
          <RecentActivity />
          <div className="flex flex-col gap-5">
            <SearchCitizen />
            <AlertsPanel />
          </div>
        </div>

        <div className="pb-16" />
      </div>
    </main>
  );
}
