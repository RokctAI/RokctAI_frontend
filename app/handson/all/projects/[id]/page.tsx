import { getProject } from "@/app/actions/handson/all/projects/projects";
import { ProjectForm } from "@/components/handson/project-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function EditProjectPage({ params }: PageProps) {
    const project = await getProject(params.id);

    if (!project) {
        notFound();
    }

    return (
        <div className="p-6">
            <ProjectForm initialData={project} isEdit={true} />
        </div>
    );
}
