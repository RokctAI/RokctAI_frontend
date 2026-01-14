"use client";

import { useEffect, useState } from "react";
import { fetchProfile, updateProfileAction, fetchCertificates } from "@/app/actions/handson/all/lms/user/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Award, User, Download } from "lucide-react";
import { formatDate } from "@/app/lib/format";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        location: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [profileData, certData] = await Promise.all([
                fetchProfile(),
                fetchCertificates()
            ]);

            if (profileData) {
                setProfile(profileData);
                setFormData({
                    first_name: profileData.first_name || "",
                    last_name: profileData.last_name || "",
                    bio: profileData.bio || "",
                    location: profileData.location || ""
                });
            }
            if (certData) setCertificates(certData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await updateProfileAction(formData);
            toast.success("Profile updated");
            loadData(); // Reload
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="about">About Me</TabsTrigger>
                    <TabsTrigger value="certificates">Certificates</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile?.user_image} />
                                <AvatarFallback className="text-2xl">{profile?.first_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
                                <p className="text-muted-foreground">{profile?.email}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Input
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="certificates" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-6 w-6 text-yellow-500" />
                                My Certificates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {certificates.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No certificates earned yet. Keep learning!
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {certificates.map((cert: any) => (
                                        <div key={cert.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div>
                                                <div className="font-semibold">{cert.course_title || cert.course}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Issued on {formatDate(cert.creation)}
                                                </div>
                                            </div>
                                            {cert.certificate_link && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={cert.certificate_link} target="_blank" rel="noreferrer">
                                                        <Download className="mr-2 h-4 w-4" /> Download
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
