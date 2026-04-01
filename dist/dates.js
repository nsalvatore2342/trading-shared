"use strict";
// dates.ts — date/time parsing helpers for Silexx Excel exports
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.parseTime = parseTime;
exports.timeToSeconds = timeToSeconds;
const XLSX = __importStar(require("xlsx"));
/**
 * Parses a raw cell value (Excel serial number or string) into an ISO date string.
 * Supports:
 *   - Excel serial number  (e.g. 45678)
 *   - MM/DD/YYYY or MM-DD-YYYY
 *   - Any string parseable by Date
 * Returns YYYY-MM-DD or null on failure.
 */
function parseDate(raw) {
    if (raw == null)
        return null;
    if (typeof raw === 'number') {
        const d = XLSX.SSF.parse_date_code(raw);
        if (!d)
            return null;
        return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
    const s = String(raw).trim();
    // MM/DD/YYYY or MM-DD-YYYY
    const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (mdy) {
        const [, m, d, y] = mdy;
        const year = y.length === 2 ? `20${y}` : y;
        return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const dt = new Date(s);
    if (!isNaN(dt.getTime()))
        return dt.toISOString().slice(0, 10);
    return null;
}
/**
 * Parses a raw cell value into an HH:MM:SS time string.
 * Supports:
 *   - Excel time fraction (0.5 = 12:00:00)
 *   - HH:MM or HH:MM:SS strings
 * Returns HH:MM:SS or null on failure.
 */
function parseTime(raw) {
    if (raw == null)
        return null;
    if (typeof raw === 'number') {
        const totalSec = Math.round(raw * 86400);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const s = String(raw).trim();
    const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
        const [, h, m, sec = '00'] = match;
        return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${sec.padStart(2, '0')}`;
    }
    return null;
}
/** Converts an HH:MM:SS string to total seconds since midnight. */
function timeToSeconds(t) {
    const [h, m, s] = t.split(':').map(Number);
    return h * 3600 + m * 60 + (s || 0);
}
