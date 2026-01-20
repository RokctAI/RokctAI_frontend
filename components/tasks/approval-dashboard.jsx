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
exports.ApprovalDashboard = ApprovalDashboard;
var react_1 = require("react");
var sonner_1 = require("sonner");
var framer_motion_1 = require("framer-motion");
function ApprovalDashboard(_a) {
    var _this = this;
    var initialLeaves = _a.leaves, initialExpenses = _a.expenses;
    var _b = (0, react_1.useState)('leaves'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, react_1.useState)(initialLeaves), leaves = _c[0], setLeaves = _c[1];
    var _d = (0, react_1.useState)(initialExpenses), expenses = _d[0], setExpenses = _d[1];
    var _e = (0, react_1.useState)(null), processing = _e[0], setProcessing = _e[1];
    var handleAction = function (doctype, name, action) { return __awaiter(_this, void 0, void 0, function () {
        var processApproval, result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setProcessing(name);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("@/app/actions/ai/hr"); })];
                case 2:
                    processApproval = (_a.sent()).processApproval;
                    return [4 /*yield*/, processApproval({ doctype: doctype, name: name, action: action })];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        sonner_1.toast.success("".concat(doctype, " ").concat(action, "d"));
                        // Optimistic update
                        if (doctype === "Leave Application") {
                            setLeaves(function (prev) { return prev.filter(function (l) { return l.name !== name; }); });
                        }
                        else {
                            setExpenses(function (prev) { return prev.filter(function (e) { return e.name !== name; }); });
                        }
                    }
                    else {
                        sonner_1.toast.error(result.error || "Action failed");
                    }
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    sonner_1.toast.error("An error occurred");
                    return [3 /*break*/, 6];
                case 5:
                    setProcessing(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden w-full max-w-md text-sm text-white">
            <div className="flex border-b border-zinc-700">
                <button onClick={function () { return setActiveTab('leaves'); }} className={"flex-1 py-3 font-medium text-center transition-colors ".concat(activeTab === 'leaves' ? 'bg-zinc-800 text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:bg-zinc-800/50')}>
                    Leave Requests ({leaves.length})
                </button>
                <button onClick={function () { return setActiveTab('expenses'); }} className={"flex-1 py-3 font-medium text-center transition-colors ".concat(activeTab === 'expenses' ? 'bg-zinc-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-800/50')}>
                    Expense Claims ({expenses.length})
                </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
                <framer_motion_1.AnimatePresence>
                    {activeTab === 'leaves' ? (leaves.length === 0 ? (<p className="text-zinc-500 text-center py-8">No pending leave requests.</p>) : (leaves.map(function (leave) { return (<framer_motion_1.motion.div key={leave.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-zinc-800/50 border border-zinc-700/50 rounded p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold">{leave.employee_name}</div>
                                            <div className="text-xs text-zinc-400">{leave.leave_type} • {leave.total_leave_days} Day(s)</div>
                                        </div>
                                        <div className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{leave.name}</div>
                                    </div>
                                    <div className="text-xs text-zinc-300 mb-3 bg-zinc-900/50 p-2 rounded">
                                        {leave.description || "No reason provided."}
                                        <div className="mt-1 text-zinc-500">{leave.from_date} ➔ {leave.to_date}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={function () { return handleAction("Leave Application", leave.name, "Reject"); }} disabled={processing === leave.name} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-300 py-1.5 rounded text-xs transition-colors border border-red-900/30">
                                            Reject
                                        </button>
                                        <button onClick={function () { return handleAction("Leave Application", leave.name, "Approve"); }} disabled={processing === leave.name} className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-300 py-1.5 rounded text-xs transition-colors border border-green-900/30">
                                            {processing === leave.name ? "..." : "Approve"}
                                        </button>
                                    </div>
                                </framer_motion_1.motion.div>); }))) : (expenses.length === 0 ? (<p className="text-zinc-500 text-center py-8">No pending expense claims.</p>) : (expenses.map(function (expense) { return (<framer_motion_1.motion.div key={expense.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-zinc-800/50 border border-zinc-700/50 rounded p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold">{expense.employee_name}</div>
                                            <div className="text-xs text-zinc-400 font-mono">${expense.total_claimed_amount.toFixed(2)}</div>
                                        </div>
                                        <div className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{expense.name}</div>
                                    </div>
                                    <div className="text-xs text-zinc-300 mb-3 bg-zinc-900/50 p-2 rounded">
                                        {expense.remark || "No details."}
                                        <div className="mt-1 text-zinc-500">Date: {expense.posting_date}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={function () { return handleAction("Expense Claim", expense.name, "Reject"); }} disabled={processing === expense.name} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-300 py-1.5 rounded text-xs transition-colors border border-red-900/30">
                                            Reject
                                        </button>
                                        <button onClick={function () { return handleAction("Expense Claim", expense.name, "Approve"); }} disabled={processing === expense.name} className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-300 py-1.5 rounded text-xs transition-colors border border-green-900/30">
                                            {processing === expense.name ? "..." : "Approve"}
                                        </button>
                                    </div>
                                </framer_motion_1.motion.div>); })))}
                </framer_motion_1.AnimatePresence>
            </div>
        </div>);
}
