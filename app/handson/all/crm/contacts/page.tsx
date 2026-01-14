
import Link from "next/link";
import { getContacts } from "@/app/actions/handson/all/crm/contacts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateContactDialog } from "@/components/handson/contacts/create-contact-dialog";
import { getDocTypeMeta } from "@/app/actions/handson/all/crm/meta";

export default async function ContactsPage() {
    const [contactsRes, metaRes] = await Promise.all([
        getContacts(1, 50),
        getDocTypeMeta("Contact")
    ]);
    const contacts = contactsRes.data || [];
    const meta = metaRes;

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                    <p className="text-muted-foreground">Manage your customer relationships.</p>
                </div>
                <CreateContactDialog meta={meta.data!} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                    {contacts.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-muted-foreground">
                            No contacts found.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Company</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Mobile</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {contacts.map((contact: any) => (
                                        <tr
                                            key={contact.name}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={contact.image} alt={contact.full_name} />
                                                        <AvatarFallback>{getInitials(contact.full_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium text-foreground">{contact.full_name}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {contact.company_name || "-"}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {contact.email_id || "-"}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {contact.mobile_no || "-"}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={contact.status === "Open" ? "default" : "secondary"}>
                                                    {contact.status}
                                                </Badge>
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
