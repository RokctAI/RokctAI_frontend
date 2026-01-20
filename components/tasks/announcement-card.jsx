"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementCard = AnnouncementCard;
var react_1 = require("react");
function AnnouncementCard(_a) {
    var announcements = _a.announcements;
    if (!announcements || announcements.length === 0) {
        return <div className="text-zinc-500 text-sm">No new announcements.</div>;
    }
    return (<div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl p-4 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-amber-500/20 p-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="8" x2="16" y1="22" y2="22"/></svg>
                </div>
                <h3 className="font-bold text-amber-200 text-sm">Announcements</h3>
            </div>

            <div className="space-y-4">
                {announcements.map(function (item) { return (<div key={item.name} className="relative pl-4 border-l-2 border-amber-500/30">
                        <div className="font-semibold text-white text-sm">{item.subject}</div>
                        <div className="text-xs text-zinc-400 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description || "" }}></div>
                        <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{new Date(item.creation).toLocaleDateString()}</div>
                    </div>); })}
            </div>
        </div>);
}
