import { Suspense } from "react";
import ManagePlan from "@/components/sections/ManagePlan";

export default function ManagePlanPage() {
  return (
    <Suspense>
      <ManagePlan />
    </Suspense>
  );
}
