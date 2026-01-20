"use client";
"use strict";
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
exports.ProjectCard = ProjectCard;
var react_1 = require("react");
var sonner_1 = require("sonner");
function ProjectCard(_a) {
    var _this = this;
    var project = _a.project;
    var _b = (0, react_1.useState)(project.name), name = _b[0], setName = _b[1];
    var _c = (0, react_1.useState)(project.description), description = _c[0], setDescription = _c[1];
    var _d = (0, react_1.useState)(false), isSaving = _d[0], setIsSaving = _d[1];
    var _e = (0, react_1.useState)(false), isSaved = _e[0], setIsSaved = _e[1];
    var handleConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch('/api/projects', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: name, description: description, modelId: project.modelId })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    setIsSaved(true);
                    sonner_1.toast.success("Project Created", {
                        description: "Project \"".concat(name, "\" has been created successfully.")
                    });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    sonner_1.toast.error(data.error || "Failed to create project");
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1 = _a.sent();
                    sonner_1.toast.error("Error creating project");
                    return [3 /*break*/, 8];
                case 7:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    if (isSaved) {
        return (<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                <p className="text-green-500 font-medium">Project Created Successfully</p>
            </div>);
    }
    return (<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 w-full flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <div className="size-8 rounded bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-indigo-400 font-bold">P</span>
                </div>
                <input value={name} onChange={function (e) { return setName(e.target.value); }} className="bg-transparent text-lg font-bold outline-none text-white w-full placeholder-zinc-500" placeholder="Project Name"/>
            </div>

            <textarea value={description} onChange={function (e) { return setDescription(e.target.value); }} className="bg-zinc-950/50 rounded-md p-2 text-sm text-zinc-300 resize-none outline-none border border-zinc-800 focus:border-zinc-700 min-h-[80px]" placeholder="Add a description for this project..."/>

            <div className="flex justify-end gap-2 pt-2">
                {/* Cancel acts as Ignore */}
                <button onClick={handleConfirm} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {isSaving ? 'Creating...' : 'Confirm Project'}
                </button>
            </div>
        </div>);
}
