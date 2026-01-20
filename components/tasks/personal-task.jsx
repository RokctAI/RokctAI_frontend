"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalTask = PersonalTask;
var react_1 = require("react");
function PersonalTask(_a) {
    var task = _a.task;
    return (<div className="border-l-4 border-wealth-green-500 bg-zinc-900 rounded-r-lg p-4 text-white w-full">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg mb-2">{task.title}</h3>
        {task.reminder_at && (<span className="text-xs text-zinc-400">
            Reminder: {new Date(task.reminder_at).toLocaleDateString()}
          </span>)}
      </div>
      {task.description && (<p className="text-sm text-zinc-300 mb-4">{task.description}</p>)}
      <div className="flex items-center justify-end gap-2">
        {task.onAccept && (<button onClick={function () { var _a; return (_a = task.onAccept) === null || _a === void 0 ? void 0 : _a.call(task, task.id); }} className="bg-wealth-green-600 hover:bg-wealth-green-700 text-white px-3 py-1 rounded-md text-sm">
            Accept
          </button>)}
        {task.onDone && (<button onClick={function () { var _a; return (_a = task.onDone) === null || _a === void 0 ? void 0 : _a.call(task, task.id); }} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm">
            Done
          </button>)}
      </div>
    </div>);
}
