"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisambiguateTask = DisambiguateTask;
var react_1 = require("react");
var button_1 = require("../ui/button");
function DisambiguateTask(_a) {
    var taskTitle = _a.taskTitle, append = _a.append;
    var handleSelectTaskType = function (taskType) {
        var clarifiedPrompt = "Create a ".concat(taskType, " task: ").concat(taskTitle);
        append({
            role: 'user',
            content: clarifiedPrompt,
        });
    };
    return (<div className="bg-zinc-800 rounded-lg p-4 text-white">
      <p className="mb-4">I can create a task for you: &quot;{taskTitle}&quot;. First, please clarify the task type:</p>
      <div className="flex gap-2">
        <button_1.Button variant="secondary" onClick={function () { return handleSelectTaskType('Project'); }}>
          Project Task
        </button_1.Button>
        <button_1.Button variant="secondary" onClick={function () { return handleSelectTaskType('CRM'); }}>
          CRM Task
        </button_1.Button>
        <button_1.Button variant="secondary" onClick={function () { return handleSelectTaskType('Personal'); }}>
          Personal Task
        </button_1.Button>
      </div>
    </div>);
}
