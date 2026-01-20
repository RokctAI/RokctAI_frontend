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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidayWorkForm = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var holiday_1 = require("@/app/actions/ai/holiday");
var departments_1 = require("@/app/actions/handson/all/hrms/departments");
var HolidayWorkForm = function (_a) {
    var holidayName = _a.holidayName, holidayDate = _a.holidayDate;
    var _b = (0, react_1.useState)("confirm"), step = _b[0], setStep = _b[1];
    var _c = (0, react_1.useState)("Me Only"), audience = _c[0], setAudience = _c[1];
    var _d = (0, react_1.useState)([]), selectedDepts = _d[0], setSelectedDepts = _d[1];
    var _e = (0, react_1.useState)([]), availableDepts = _e[0], setAvailableDepts = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    (0, react_1.useEffect)(function () {
        if (step === "audience") {
            var fetchDepts = function () { return __awaiter(void 0, void 0, void 0, function () {
                var depts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, departments_1.getDepartments)()];
                        case 1:
                            depts = _a.sent();
                            setAvailableDepts(depts);
                            return [2 /*return*/];
                    }
                });
            }); };
            fetchDepts();
        }
    }, [step]);
    var handleConfirm = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    return [4 /*yield*/, (0, holiday_1.announceHolidayWork)({
                            holiday: "".concat(holidayName, " (").concat(holidayDate, ")"),
                            audience: audience,
                            departments: selectedDepts
                        })];
                case 1:
                    result = _a.sent();
                    setLoading(false);
                    if (result.success) {
                        setStep("done");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    if (step === "done") {
        return (<div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                <lucide_react_1.Check className="w-5 h-5 inline mr-2"/>
                Work schedule confirmed for {holidayName}.
            </div>);
    }
    return (<div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm w-full max-w-md">
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Upcoming Holiday</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{holidayName}</h3>
                <span className="text-sm text-zinc-500">{holidayDate}</span>
            </div>

            {step === "confirm" && (<div className="flex flex-col gap-3">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Are you working on this day?
                    </p>
                    <div className="flex gap-2">
                        <button onClick={function () { return setStep("audience"); }} className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 flex justify-center items-center gap-2">
                            <lucide_react_1.Check className="w-4 h-4"/> Yes
                        </button>
                        <button onClick={function () { return setStep("done"); }} // Logic: If No, we effectively do nothing or log removal? For now treating as "Done"
         className="flex-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 flex justify-center items-center gap-2">
                            <lucide_react_1.X className="w-4 h-4"/> No
                        </button>
                    </div>
                </div>)}

            {step === "audience" && (<div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Who is working?</label>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                { id: "Me Only", icon: lucide_react_1.User, label: "Me Only" },
                { id: "All", icon: lucide_react_1.Users, label: "All Staff" },
                { id: "Departments", icon: lucide_react_1.Building, label: "Depts" }
            ].map(function (opt) { return (<button key={opt.id} onClick={function () { return setAudience(opt.id); }} className={"flex flex-col items-center gap-1 p-2 rounded-md border text-xs ".concat(audience === opt.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800")}>
                                    <opt.icon className="w-4 h-4"/>
                                    {opt.label}
                                </button>); })}
                        </div>
                    </div>

                    {audience === "Departments" && (<div className="flex flex-col gap-2 max-h-32 overflow-y-auto border p-2 rounded-md bg-zinc-50 dark:bg-zinc-900">
                            {availableDepts.length === 0 ? (<span className="text-xs text-zinc-400">Loading departments...</span>) : (availableDepts.map(function (dept) { return (<label key={dept.name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded">
                                        <input type="checkbox" checked={selectedDepts.includes(dept.department_name)} onChange={function (e) {
                        if (e.target.checked) {
                            setSelectedDepts(__spreadArray(__spreadArray([], selectedDepts, true), [dept.department_name], false));
                        }
                        else {
                            setSelectedDepts(selectedDepts.filter(function (d) { return d !== dept.department_name; }));
                        }
                    }} className="rounded border-zinc-300"/>
                                        {dept.department_name}
                                    </label>); }))}
                        </div>)}

                    <button onClick={handleConfirm} disabled={loading || (audience === "Departments" && selectedDepts.length === 0)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Confirming..." : "Confirm Schedule"}
                    </button>

                    <button onClick={function () { return setStep("confirm"); }} className="text-xs text-zinc-400 hover:text-zinc-600 text-center">
                        Back
                    </button>
                </div>)}
        </div>);
};
exports.HolidayWorkForm = HolidayWorkForm;
