"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { User, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { updateUserProfile } from "@/app/actions/handson/all/settings/profile";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    useEffect(() => {
        if (session?.user) {
            setFormData({
                first_name: session.user.name?.split(' ')[0] || "",
                last_name: session.user.name?.split(' ').slice(1).join(' ') || "",
                email: session.user.email || "",
            });
        }
    }, [session]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateUserProfile(formData.email, {
                first_name: formData.first_name,
                last_name: formData.last_name
            });

            if (res.success) {
                toast.success("Profile updated successfully");
                // Trigger session update if possible to reflect changes immediately in UI
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: `${formData.first_name} ${formData.last_name}`
                    }
                });
            } else {
                toast.error("Failed to update profile: " + res.error);
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your account details and preferences.</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Avatar Section */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Avatar</CardTitle>
                        <CardDescription>This is your public display image.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                            <AvatarFallback className="text-4xl bg-muted">
                                {session?.user?.name?.slice(0, 2).toUpperCase() || "CN"}
                            </AvatarFallback>
                        </Avatar>

                        <Button variant="outline" size="sm" disabled>
                            Upload New Image
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            (Image upload coming soon)
                        </p>
                    </CardContent>
                </Card>

                {/* Details Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" value={formData.email} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={loading}>
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
