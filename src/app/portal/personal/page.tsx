import { PersonalStep } from "@/components/PersonalStep";
import { PortalSidebar } from "@/components/Sidebar";

export default function PortalPersonalPage() {
  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <PortalSidebar activeLabel="Personal Info" />
      <div className="flex-1 flex flex-col min-w-0">
        <PersonalStep />
      </div>
    </div>
  );
}
