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
exports.POST = POST;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, userError, error, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    // Log tous les cookies reçus
                    console.log('[PING] cookies:', __spreadArray([], (0, headers_1.cookies)(), true));
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 1:
                    _a = _b.sent(), user = _a.data.user, userError = _a.error;
                    if (userError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Not authenticated', debug: { user: user, userError: userError } }, { status: 401 })];
                    }
                    // Log l'utilisateur détecté
                    console.log('[PING] user:', user);
                    return [4 /*yield*/, supabase
                            .from('User')
                            .update({ last_seen: new Date().toISOString() })
                            .eq('id', user.id)];
                case 2:
                    error = (_b.sent()).error;
                    // Log le résultat de l'update
                    console.log('[PING] update User.last_seen for id:', user.id, 'error:', error);
                    if (error) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: error.message, debug: { userId: user.id, updateError: error, user: user } }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, debug: { userId: user.id } })];
                case 3:
                    e_1 = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ error: e_1.message, stack: e_1.stack, debug: { user: null } }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
