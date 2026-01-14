import { Calendar, Clock, Video, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpcomingEventsProps {
    liveClasses: any[];
    evals: any[];
}

export function UpcomingEvents({ liveClasses, evals }: UpcomingEventsProps) {
    return (
        <section className="grid md:grid-cols-2 gap-8">
            {/* Upcoming Live Classes */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Live Classes</h2>
                {liveClasses && liveClasses.length > 0 ? (
                    <div className="space-y-4">
                        {liveClasses.map((cls: any) => (
                            <div key={cls.name} className="border rounded-lg p-4 bg-white shadow-sm">
                                <h3 className="font-medium text-gray-900 mb-2">{cls.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.description}</p>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {cls.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {cls.time} - {cls.duration} min
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    {cls.join_url && (
                                        <Button size="sm" asChild variant="default" className="w-full">
                                            <a href={cls.join_url} target="_blank" rel="noopener noreferrer">
                                                <Video className="w-4 h-4 mr-2" /> Join
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 italic">No upcoming live classes.</div>
                )}
            </div>

            {/* Upcoming Evaluations */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Evaluations</h2>
                {evals && evals.length > 0 ? (
                    <div className="space-y-4">
                        {evals.map((ev: any) => (
                            <div key={ev.name} className="border rounded-lg p-4 bg-white shadow-sm">
                                <h3 className="font-medium text-gray-900 mb-2">{ev.course_title}</h3>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {ev.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {ev.start_time}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        Evaluator: {ev.evaluator_name}
                                    </div>
                                </div>
                                {ev.google_meet_link && (
                                    <div className="mt-4">
                                        <Button size="sm" variant="outline" className="w-full" asChild>
                                            <a href={ev.google_meet_link} target="_blank" rel="noreferrer">
                                                Join Call
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 italic">
                        Schedule an evaluation to get certified.
                    </div>
                )}
            </div>
        </section>
    );
}
