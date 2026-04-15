import QRCode from 'qrcode';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import path from 'path'
import fs from 'fs';

const writeFileAsync = promisify(createWriteStream);

export class QRService {
    async generateQRCode(data: string, filePath: string): Promise<string> {
        try {
            const qrPath = path.join(process.cwd(), 'Public', 'qrcodes', filePath);

            const dir = path.dirname(qrPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await QRCode.toFile(qrPath, data);
            return `/qrcodes/${filePath}`;
        } catch (error) {
            throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    createQRData(UserId: string): string {
        return JSON.stringify({ type: 'emergency', userId: UserId });  
        }
    }