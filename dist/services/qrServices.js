"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_2 = __importDefault(require("fs"));
const writeFileAsync = (0, util_1.promisify)(fs_1.createWriteStream);
class QRService {
    async generateQRCode(data, filePath) {
        try {
            const qrPath = path_1.default.join(process.cwd(), 'Public', 'qrcodes', filePath);
            const dir = path_1.default.dirname(qrPath);
            if (!fs_2.default.existsSync(dir)) {
                fs_2.default.mkdirSync(dir, { recursive: true });
            }
            await qrcode_1.default.toFile(qrPath, data);
            return `/qrcodes/${filePath}`;
        }
        catch (error) {
            throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    createQRData(UserId) {
        return JSON.stringify({ type: 'emergency', userId: UserId });
    }
}
exports.QRService = QRService;
