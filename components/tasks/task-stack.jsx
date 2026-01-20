"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStack = TaskStack;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var sonner_1 = require("sonner");
// import { useAcceptedTasks } from "@/lib/context/accepted-tasks-context";
var deal_task_1 = require("./deal-task");
var project_task_1 = require("./project-task");
function TaskStack(_a) {
    var _this = this;
    var initialTasks = _a.initialTasks;
    var _b = (0, react_1.useState)(initialTasks), tasks = _b[0], setTasks = _b[1];
    // const { addTask } = useAcceptedTasks();
    var handleAccept = function (taskId, updates) { return __awaiter(_this, void 0, void 0, function () {
        var task, finalData, response, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    task = tasks.find(function (t) { return t.data.id === taskId; });
                    if (!task)
                        return [2 /*return*/];
                    finalData = __assign(__assign({}, task.data), updates);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/tasks', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(finalData)
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    sonner_1.toast.success("Task Saved", {
                        description: "This task has been synced to your project.",
                    });
                    setTasks(function (prevTasks) { return prevTasks.filter(function (t) { return t.data.id !== taskId; }); });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    sonner_1.toast.error(data.error || "Failed to save task");
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    sonner_1.toast.error("Error saving task");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    if (tasks.length === 0) {
        return (<div className="text-center text-zinc-500 p-4">
        No more tasks.
      </div>);
    }
    return (<div className="relative h-48 w-full">
      <framer_motion_1.AnimatePresence>
        {tasks.map(function (task, index) {
            var isTop = index === tasks.length - 1;
            return (<framer_motion_1.motion.div key={task.data.id} className="absolute w-full" style={{
                    zIndex: index,
                    transform: "scale(".concat(1 - (tasks.length - 1 - index) * 0.05, ") translateY(-").concat((tasks.length - 1 - index) * 10, "px)"),
                }} animate={{
                    scale: 1 - (tasks.length - 1 - index) * 0.05,
                    y: "-".concat((tasks.length - 1 - index) * 10, "px"),
                }} exit={{ opacity: 0, y: -50, scale: 0.9 }} transition={{ duration: 0.3 }}>
              <div className={!isTop ? 'pointer-events-none' : ''}>
                {task.type === 'project' ? (<project_task_1.ProjectTask task={__assign(__assign({}, task.data), { onAccept: isTop ? function (id, updates) { return handleAccept(id, updates); } : undefined })}/>) : (<deal_task_1.DealTask task={__assign(__assign({}, task.data), { onAccept: isTop ? handleAccept : undefined })}/>)}
              </div>
            </framer_motion_1.motion.div>);
        })}
      </framer_motion_1.AnimatePresence>
    </div>);
}
