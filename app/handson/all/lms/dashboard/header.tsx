import { Flame } from "lucide-react";

interface DashboardHeaderProps {
    fullName: string;
    streak: { current_streak: number } | null;
}

export function DashboardHeader({ fullName, streak }: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Hey, <a href="/handson/all/lms/me/profile" className="hover:underline">{fullName || 'Student'}</a> 👋
                </h1>
                <p className="text-gray-500 mt-1">
                    Resume where you left off
                </p>
            </div>
            {streak && (
                <div className="bg-orange-100 flex items-center gap-2 px-3 py-1.5 rounded-full text-orange-700 font-medium">
                    <Flame className="w-4 h-4" />
                    {streak.current_streak || 0} Day Streak
                </div>
            )}
        </div>
    );
}
