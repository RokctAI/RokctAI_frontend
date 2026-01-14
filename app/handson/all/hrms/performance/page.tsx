"use server";

import { getAllGoals, getAllAppraisals } from "@/app/actions/handson/all/hrms/performance";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import ClientPerformancePage from "./client_page";

export default async function PerformancePage() {
    const goals = await getAllGoals();
    const appraisals = await getAllAppraisals();
    const employees = await getEmployees();

    return <ClientPerformancePage initialGoals={goals} initialAppraisals={appraisals} employees={employees} />;
}
