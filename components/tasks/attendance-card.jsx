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
exports.AttendanceCard = AttendanceCard;
var react_1 = require("react");
var sonner_1 = require("sonner");
function AttendanceCard(_a) {
    var _this = this;
    var log_type = _a.log_type;
    var _b = (0, react_1.useState)("IDLE"), status = _b[0], setStatus = _b[1];
    var _c = (0, react_1.useState)(null), coords = _c[0], setCoords = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var getLocation = function () {
        setStatus("LOCATING");
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setStatus("IDLE");
            return;
        }
        navigator.geolocation.getCurrentPosition(function (position) {
            setCoords({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setStatus("IDLE");
        }, function (err) {
            setError("Unable to retrieve location: ".concat(err.message));
            setStatus("IDLE");
        });
    };
    var handleConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var markAiAttendance, result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!coords)
                        return [2 /*return*/];
                    setStatus("MARKING");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("@/app/actions/ai/hr"); })];
                case 2:
                    markAiAttendance = (_a.sent()).markAiAttendance;
                    return [4 /*yield*/, markAiAttendance({
                            log_type: log_type, // Optional: let backend toggle if undefined
                            latitude: coords.lat,
                            longitude: coords.lng
                        })];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        setStatus("DONE");
                        sonner_1.toast.success(result.message);
                    }
                    else {
                        setError(result.error);
                        setStatus("IDLE");
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    setError("Failed to mark attendance");
                    setStatus("IDLE");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (status === "DONE") {
        return (<div className="bg-emerald-900/20 border border-emerald-900 rounded-lg p-4 w-full max-w-sm text-sm text-white">
                <h3 className="font-bold text-emerald-500 mb-2">Check-in Successful</h3>
                <p className="text-zinc-400">Marked at {new Date().toLocaleTimeString()} with location.</p>
            </div>);
    }
    return (<div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-sm text-sm text-white space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-blue-400">📍 Attendance</h3>
                {coords && <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">GPS Locked</span>}
            </div>

            <p className="text-zinc-400 text-xs">
                {log_type ? "Confirm ".concat(log_type, " check-in") : "Confirm check-in"} with your current location.
            </p>

            {error && (<div className="text-red-400 text-xs bg-red-900/10 p-2 rounded">
                    {error}
                </div>)}

            {!coords ? (<button onClick={getLocation} disabled={status === "LOCATING"} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded py-2 font-medium flex items-center justify-center gap-2">
                    {status === "LOCATING" ? (<>📡 Acquiring Satellite Lock...</>) : (<>📍 Get Current Location</>)}
                </button>) : (<div className="space-y-2">
                    <div className="text-xs text-zinc-500 font-mono bg-black/20 p-2 rounded">
                        Lat: {coords.lat.toFixed(4)}, Long: {coords.lng.toFixed(4)}
                    </div>
                    <button onClick={handleConfirm} disabled={status === "MARKING"} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-medium">
                        {status === "MARKING" ? "Marking..." : "Confirm & Mark"}
                    </button>
                </div>)}
        </div>);
}
