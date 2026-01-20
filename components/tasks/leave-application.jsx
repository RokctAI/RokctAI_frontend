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
exports.LeaveApplication = LeaveApplication;
var react_1 = require("react");
function LeaveApplication(_a) {
    var _this = this;
    var _b = _a.leave_type, leave_type = _b === void 0 ? "Privilege Leave" : _b, from_date = _a.from_date, to_date = _a.to_date, reason = _a.reason, onApply = _a.onApply;
    var _c = (0, react_1.useState)({
        leave_type: leave_type,
        from_date: from_date || new Date().toISOString().split('T')[0],
        to_date: to_date || new Date().toISOString().split('T')[0],
        reason: reason || ""
    }), formData = _c[0], setFormData = _c[1];
    var _d = (0, react_1.useState)(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var applyAiLeave, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    if (!onApply) return [3 /*break*/, 1];
                    onApply(formData);
                    return [3 /*break*/, 4];
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("@/app/actions/ai/hr"); })];
                case 2:
                    applyAiLeave = (_a.sent()).applyAiLeave;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 4];
                case 4:
                    setIsSubmitting(false);
                    return [2 /*return*/];
            }
        });
    }); };
    return (<div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-sm text-sm text-white space-y-3">
            <h3 className="font-bold text-lg text-blue-400">🌴 Apply for Leave</h3>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Leave Type</label>
                <select value={formData.leave_type} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { leave_type: e.target.value })); }} className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1">
                    <option>Privilege Leave</option>
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Leave Without Pay</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400">From</label>
                    <input type="date" value={formData.from_date} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { from_date: e.target.value })); }} className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1"/>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400">To</label>
                    <input type="date" value={formData.to_date} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { to_date: e.target.value })); }} className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1"/>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Reason</label>
                <textarea value={formData.reason} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { reason: e.target.value })); }} className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 h-16 resize-none" placeholder="Taking a break..."/>
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-medium transition-colors">
                {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
        </div>);
}
