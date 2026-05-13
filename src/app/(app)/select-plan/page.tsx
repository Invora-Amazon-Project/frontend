import { Suspense } from "react";
import SelectPlan from "@/components/sections/SelectPlan";

export const metadata = {
  title: "Choose your plan — Invora",
};

export default function SelectPlanPage() {
  return (
    <Suspense>
      <SelectPlan />
    </Suspense>
  );
}
