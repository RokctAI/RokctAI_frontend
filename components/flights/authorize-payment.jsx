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
exports.AuthorizePayment = AuthorizePayment;
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var sonner_1 = require("sonner");
var swr_1 = require("swr");
var utils_1 = require("@/lib/utils");
var icons_1 = require("../custom/icons");
var input_1 = require("../ui/input");
function AuthorizePayment(_a) {
    var _this = this;
    var _b = _a.intent, intent = _b === void 0 ? { reservationId: "sample-uuid" } : _b;
    var _c = (0, swr_1.default)("/api/reservation?id=".concat(intent.reservationId), utils_1.fetcher), reservation = _c.data, mutate = _c.mutate;
    var _d = (0, react_1.useState)(""), input = _d[0], setInput = _d[1];
    var handleAuthorize = function (magicWord) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorText, updatedReservation, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/reservation?id=".concat(intent.reservationId), {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ magicWord: magicWord }),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    errorText = _a.sent();
                    throw new Error(errorText || response.statusText);
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    updatedReservation = _a.sent();
                    mutate(updatedReservation);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error) {
                        sonner_1.toast.error(error_1.message);
                    }
                    else {
                        sonner_1.toast.error("An unknown error occurred");
                    }
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (reservation === null || reservation === void 0 ? void 0 : reservation.hasCompletedPayment) ? (<div className="bg-emerald-500 p-4 rounded-lg gap-4 flex flex-row justify-between items-center">
      <div className="dark:text-emerald-950 text-emerald-50 font-medium">
        Payment Verified
      </div>
      <div className="dark:text-emerald-950 text-emerald-50">
        <icons_1.CheckCircle size={20}/>
      </div>
    </div>) : (0, date_fns_1.differenceInMinutes)(new Date(), new Date(reservation === null || reservation === void 0 ? void 0 : reservation.createdAt)) >
        150 ? (<div className="bg-red-500 p-4 rounded-lg gap-4 flex flex-row justify-between items-center">
      <div className="text-background">Payment Gateway Timed Out</div>
      <div className="text-background">
        <icons_1.InfoIcon size={20}/>
      </div>
    </div>) : (<div className="bg-muted p-4 rounded-lg flex flex-col gap-2">
      <div className="text font-medium">
        Use your saved information for this transaction
      </div>
      <div className="text-muted-foreground text-sm sm:text-base">
        Enter the magic word to authorize payment. Hint: It rhymes with bercel.
      </div>

      <input_1.Input type="text" placeholder="Enter magic word..." className="dark:bg-zinc-700 text-base border-none mt-2" onChange={function (event) { return setInput(event.currentTarget.value); }} onKeyDown={function (event) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(event.key === "Enter")) return [3 /*break*/, 2];
                        return [4 /*yield*/, handleAuthorize(input)];
                    case 1:
                        _a.sent();
                        setInput("");
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }}/>
    </div>);
}
