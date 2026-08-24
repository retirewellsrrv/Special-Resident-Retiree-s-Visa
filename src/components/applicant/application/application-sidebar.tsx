import { ApplicationSupportCard } from "./application-support-card";
import { PraMarketerCard } from "./pra-marketer-card";

export function ApplicationSidebar() {
  return (
    <div className="flex flex-col gap-5">
      <ApplicationSupportCard />
      <PraMarketerCard />
    </div>
  );
}
