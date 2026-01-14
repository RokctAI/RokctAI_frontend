import { getProjects } from "@/app/actions/handson/all/projects/projects";
import { ProjectList } from "@/components/handson/project-list";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="p-6">
            <ProjectList projects={projects} />
        </div>
    );
}
