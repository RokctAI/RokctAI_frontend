import { getMyTasks } from "@/app/actions/handson/all/projects/me/tasks";
import { TaskList } from "@/components/handson/task-components";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
    const tasks = await getMyTasks();
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
            <TaskList tasks={tasks} />
        </div>
    );
}
