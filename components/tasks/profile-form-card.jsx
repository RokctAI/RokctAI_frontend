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
exports.ProfileFormCard = ProfileFormCard;
var react_1 = require("react");
var hr_1 = require("@/app/actions/ai/hr");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
function ProfileFormCard(_a) {
    var _this = this;
    var initialData = _a.initialData, onCallback = _a.onCallback;
    var _b = (0, react_1.useState)({
        id_number: (initialData === null || initialData === void 0 ? void 0 : initialData.id_number) || "",
        bank_name: (initialData === null || initialData === void 0 ? void 0 : initialData.bank_name) || "",
        bank_account_no: (initialData === null || initialData === void 0 ? void 0 : initialData.bank_account_no) || "",
        bank_branch_code: (initialData === null || initialData === void 0 ? void 0 : initialData.bank_branch_code) || "",
        tax_id: (initialData === null || initialData === void 0 ? void 0 : initialData.tax_id) || ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)("idle"), status = _c[0], setStatus = _c[1];
    var _d = (0, react_1.useState)(""), message = _d[0], setMessage = _d[1];
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setStatus("submitting");
                    return [4 /*yield*/, (0, hr_1.updateAiMyProfile)(formData)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        setStatus("success");
                        setMessage("Profile updated successfully.");
                        if (onCallback)
                            onCallback(result);
                    }
                    else {
                        setStatus("error");
                        setMessage(result.error || "Failed to update profile.");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    if (status === "success") {
        return (<card_1.Card className="w-full max-w-md bg-purple-50/50 border-purple-200 backdrop-blur-sm">
                <card_1.CardContent className="pt-6 flex flex-col items-center text-center">
                    <lucide_react_1.CheckCircle className="h-12 w-12 text-purple-500 mb-2"/>
                    <h3 className="font-semibold text-purple-800 text-sm">Profile Updated</h3>
                    <p className="text-xs text-purple-700">Your verification details have been saved.</p>
                </card_1.CardContent>
            </card_1.Card>);
    }
    return (<card_1.Card className="w-full max-w-md shadow-lg glass-card border-purple-500/20">
            <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <lucide_react_1.ShieldCheck className="h-4 w-4 text-purple-500"/>
                    Bank-Level Verification
                </card_1.CardTitle>
            </card_1.CardHeader>
            <form onSubmit={handleSubmit}>
                <card_1.CardContent className="space-y-3 pb-4">
                    <div className="space-y-1">
                        <label_1.Label htmlFor="id_number" className="text-[10px] uppercase tracking-wider text-muted-foreground">SA ID Number</label_1.Label>
                        <input_1.Input id="id_number" value={formData.id_number} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { id_number: e.target.value })); }} placeholder="13-digit checksum validated" className="h-8 text-sm"/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label_1.Label htmlFor="bank_name" className="text-[10px] uppercase tracking-wider text-muted-foreground">Bank Name</label_1.Label>
                            <input_1.Input id="bank_name" value={formData.bank_name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { bank_name: e.target.value })); }} placeholder="e.g. FNB" className="h-8 text-sm"/>
                        </div>
                        <div className="space-y-1">
                            <label_1.Label htmlFor="tax_id" className="text-[10px] uppercase tracking-wider text-muted-foreground">Tax ID (SARS)</label_1.Label>
                            <input_1.Input id="tax_id" value={formData.tax_id} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { tax_id: e.target.value })); }} placeholder="SARS Ref" className="h-8 text-sm"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label_1.Label htmlFor="bank_account_no" className="text-[10px] uppercase tracking-wider text-muted-foreground">Account Number</label_1.Label>
                            <input_1.Input id="bank_account_no" value={formData.bank_account_no} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { bank_account_no: e.target.value })); }} placeholder="Digits only" className="h-8 text-sm"/>
                        </div>
                        <div className="space-y-1">
                            <label_1.Label htmlFor="bank_branch_code" className="text-[10px] uppercase tracking-wider text-muted-foreground">Branch Code</label_1.Label>
                            <input_1.Input id="bank_branch_code" value={formData.bank_branch_code} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { bank_branch_code: e.target.value })); }} placeholder="6 digits" className="h-8 text-sm"/>
                        </div>
                    </div>

                    {status === "error" && (<div className="text-[10px] text-red-500 bg-red-50 p-2 rounded flex items-center gap-2">
                            <lucide_react_1.AlertCircle className="h-3 w-3"/> {message}
                        </div>)}
                </card_1.CardContent>
                <card_1.CardFooter className="pt-0">
                    <button_1.Button type="submit" className="w-full h-8 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white" disabled={status === "submitting"}>
                        {status === "submitting" && <lucide_react_1.Loader2 className="mr-2 h-3 w-3 animate-spin"/>}
                        Save Verification Details
                    </button_1.Button>
                </card_1.CardFooter>
            </form>
        </card_1.Card>);
}
