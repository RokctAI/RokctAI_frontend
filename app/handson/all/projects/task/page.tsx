import { getTasks } from "@/app/actions/handson/all/projects/tasks";
import { TaskList } from "@/components/handson/task-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getTasks();
    return <div className="p-6"><TaskList tasks={data} /></div>;
}
