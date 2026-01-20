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
exports.ResignationConfirmation = ResignationConfirmation;
var react_1 = require("react");
function ResignationConfirmation(_a) {
    var _this = this;
    var onConfirm = _a.onConfirm, onCancel = _a.onCancel;
    var _b = (0, react_1.useState)(""), reason = _b[0], setReason = _b[1];
    var _c = (0, react_1.useState)(""), lwd = _c[0], setLwd = _c[1];
    var _d = (0, react_1.useState)(false), isConfirmed = _d[0], setIsConfirmed = _d[1];
    var _e = (0, react_1.useState)(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var submitResignation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    if (!onConfirm) return [3 /*break*/, 1];
                    onConfirm({ reason: reason, last_working_day: lwd });
                    return [3 /*break*/, 4];
                case 1: return [4 /*yield*/, Promise.resolve().then(function () { return require("@/app/actions/ai/hr"); })];
                case 2:
                    submitResignation = (_a.sent()).submitResignation;
                    return [4 /*yield*/, submitResignation({ reason: reason, last_working_day: lwd })];
                case 3:
                    _a.sent();
                    setIsConfirmed(true);
                    _a.label = 4;
                case 4:
                    setIsSubmitting(false);
                    return [2 /*return*/];
            }
        });
    }); };
    if (isConfirmed) {
        return (<div className="bg-red-900/20 border border-red-900 rounded-lg p-4 w-full max-w-sm text-sm text-white">
                <h3 className="font-bold text-red-500 mb-2">Resignation Submitted</h3>
                <p className="text-zinc-400">Your resignation has been filed. HR will be in touch shortly.</p>
            </div>);
    }
    return (<div className="bg-zinc-900 border border-red-900/50 rounded-lg p-4 w-full max-w-sm text-sm text-white space-y-3">
            <h3 className="font-bold text-lg text-red-500">⚠️ Resignation</h3>
            <p className="text-zinc-400 text-xs">
                Are you sure you want to resign? This action will initiate your separation process.
            </p>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Proposed Last Working Day</label>
                <input type="date" value={lwd} onChange={function (e) { return setLwd(e.target.value); }} className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1"/>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Reason (Optional)</label>
                <textarea value={reason} onChange={function (e) { return setReason(e.target.value); }} className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 h-16 resize-none" placeholder="I have decided to move on..."/>
            </div>

            <div className="flex gap-2 pt-2">
                <button onClick={onCancel} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded py-2">
                    Cancel
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting || !lwd} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2 font-medium">
                    {isSubmitting ? "Submitting..." : "Confirm Resignation"}
                </button>
            </div>
        </div>);
}
