
import Link from "next/link";
import { getOrganizations } from "@/app/actions/handson/all/crm/organizations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateOrganizationDialog } from "@/components/handson/organizations/create-organization-dialog";
import { getDocTypeMeta } from "@/app/actions/handson/all/crm/meta";

export default async function OrganizationsPage() {
    const [orgsRes, metaRes] = await Promise.all([
        getOrganizations(1, 50),
        getDocTypeMeta("CRM Organization")
    ]);
    const organizations = orgsRes.data || [];
    const meta = metaRes;

    // Helper Initials
    const getInitials = (name: string) => {
        return (name || "?").substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">Track companies and accounts.</p>
                </div>
                <CreateOrganizationDialog meta={meta.data!} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                    {organizations.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-muted-foreground">
                            No organizations found.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Organization</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Website</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {organizations.map((org: any) => (
                                        <tr
                                            key={org.name}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={org.organization_logo} alt={org.organization_name} />
                                                        <AvatarFallback>{getInitials(org.organization_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-foreground">{org.organization_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {org.website ? (
                                                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                                        {org.website}
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {new Date(org.creation).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
