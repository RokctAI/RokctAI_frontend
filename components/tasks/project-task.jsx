"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTask = ProjectTask;
var lucide_react_1 = require("lucide-react");
var image_1 = require("next/image");
var react_1 = require("react");
var projects_1 = require("@/app/actions/handson/all/projects/projects");
function ProjectTask(_a) {
    var _b, _c;
    var task = _a.task;
    var _d = react_1.default.useState(false), isSelectingProject = _d[0], setIsSelectingProject = _d[1];
    var _e = react_1.default.useState([]), projects = _e[0], setProjects = _e[1];
    var _f = react_1.default.useState(undefined), selectedProject = _f[0], setSelectedProject = _f[1];
    var _g = react_1.default.useState(task.end_date), selectedDate = _g[0], setSelectedDate = _g[1];
    react_1.default.useEffect(function () {
        if (isSelectingProject && projects.length === 0) {
            (0, projects_1.getProjects)().then(function (res) { return setProjects(res); });
        }
    }, [isSelectingProject]);
    var priority_color = {
        critical: 'border-red-500',
        high: 'border-orange-500',
        medium: 'border-blue-500',
        low: 'border-green-500',
    };
    var _h = react_1.default.useState(false), isSelectingUser = _h[0], setIsSelectingUser = _h[1];
    var _j = react_1.default.useState([]), users = _j[0], setUsers = _j[1];
    var _k = react_1.default.useState(undefined), selectedAssignee = _k[0], setSelectedAssignee = _k[1];
    react_1.default.useEffect(function () {
        if (isSelectingUser && users.length === 0) {
            // Lazy load users
            Promise.resolve().then(function () { return require("@/app/actions/handson/all/hrms/employees"); }).then(function (mod) {
                mod.getEmployees().then(function (res) { return setUsers(res.map(function (e) { return ({ email: e.user_id, full_name: e.employee_name }); })); });
            });
        }
    }, [isSelectingUser]);
    return (<div className={"border-l-4 ".concat(priority_color[task.priority], " bg-zinc-900 rounded-r-lg p-4 text-white w-full")}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg mb-2">{task.name}</h3>
        <div className="flex flex-col items-end">
          {selectedDate ? (<span className="text-xs text-zinc-400">Due: {new Date(selectedDate).toLocaleDateString()}</span>) : (<input type="date" className="bg-transparent text-xs text-zinc-500 border-none outline-none focus:ring-0 w-24" onChange={function (e) { return setSelectedDate(e.target.value); }}/>)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden items-center">
          {/* Show Selected Assignee Avatar if picked locally, else task assignees */}
          {selectedAssignee ? (<div className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-zinc-900 bg-blue-600 text-xs font-bold">
              {((_c = (_b = users.find(function (u) { return u.email === selectedAssignee; })) === null || _b === void 0 ? void 0 : _b.full_name) === null || _c === void 0 ? void 0 : _c.charAt(0)) || "U"}
            </div>) : (task.assignees.length > 0 ? task.assignees.map(function (assignee) { return (assignee.avatar ? (<image_1.default key={assignee.id} className="inline-block size-8 rounded-full ring-2 ring-zinc-900" src={assignee.avatar} alt={assignee.name} width={32} height={32}/>) : (<div key={assignee.id} className="inline-flex items-center justify-center size-8 rounded-full ring-2 ring-zinc-900 bg-zinc-700">
                  <lucide_react_1.UserCircle2 className="size-6 text-zinc-400"/>
                </div>)); }) : (<span className="text-xs text-zinc-500 italic mr-2">Unassigned</span>))}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {task.onAccept && (<div className="flex gap-2 items-center">
              {/* Project Linker */}
              {!isSelectingProject ? (<button onClick={function () { return setIsSelectingProject(true); }} className="bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-xs">
                  Link Project
                </button>) : (<select className="bg-zinc-800 text-white text-xs border border-zinc-600 rounded px-1 py-1 max-w-[100px]" onChange={function (e) { return setSelectedProject(e.target.value); }} value={selectedProject || ""}>
                  <option value="">Project...</option>
                  {projects.map(function (p) { return (<option key={p.name} value={p.name}>{p.project_name}</option>); })}
                </select>)}

              {/* User Assigner */}
              {!isSelectingUser ? (<button onClick={function () { return setIsSelectingUser(true); }} className="bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-xs">
                  Assign
                </button>) : (<select className="bg-zinc-800 text-white text-xs border border-zinc-600 rounded px-1 py-1 max-w-[100px]" onChange={function (e) { return setSelectedAssignee(e.target.value); }} value={selectedAssignee || ""}>
                  <option value="">User...</option>
                  {users.map(function (u) { return (<option key={u.email} value={u.email}>{u.full_name || u.email}</option>); })}
                </select>)}

              <button onClick={function () { var _a; return (_a = task.onAccept) === null || _a === void 0 ? void 0 : _a.call(task, task.id, { project: selectedProject, assignee: selectedAssignee, end_date: selectedDate }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                Accept
              </button>
            </div>)}
        </div>
      </div>
    </div>);
}
