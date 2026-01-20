"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetReminder = SetReminder;
var react_1 = require("react");
var button_1 = require("../ui/button");
function SetReminder(_a) {
    var taskId = _a.taskId, append = _a.append;
    var handleSetReminder = function (when) {
        var prompt = "Set a reminder for task ".concat(taskId, " for ").concat(when);
        append({
            role: 'user',
            content: prompt,
        });
    };
    return (<div className="bg-zinc-800 rounded-lg p-4 text-white">
      <p className="mb-4">Would you like to set a reminder for this task?</p>
      <div className="flex gap-2">
        <button_1.Button variant="secondary" onClick={function () { return handleSetReminder('Today'); }}>
          Today
        </button_1.Button>
        <button_1.Button variant="secondary" onClick={function () { return handleSetReminder('Tomorrow'); }}>
          Tomorrow
        </button_1.Button>
        <button_1.Button variant="secondary" onClick={function () { return handleSetReminder('Next Week'); }}>
          Next Week
        </button_1.Button>
      </div>
    </div>);
}
