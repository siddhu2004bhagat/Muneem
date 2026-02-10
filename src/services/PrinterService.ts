import { toast } from "sonner";

class PrinterService {
    private apiUrl = '/api/v1/printer';

    async print(data: Uint8Array): Promise<boolean> {
        try {
            // Convert Uint8Array to Base64 string
            const binaryString = Array.from(data).map(byte => String.fromCharCode(byte)).join('');
            const base64Data = btoa(binaryString);

            const response = await fetch(`${this.apiUrl}/raw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: base64Data }),
            });

            if (!response.ok) {
                throw new Error('Print failed');
            }

            return true;
        } catch (error) {
            console.error('Printer API Error:', error);
            // toast.error("Printer connection failed");
            return false;
        }
    }

    async getStatus(): Promise<{ status: string, port: string }> {
        try {
            const response = await fetch(`${this.apiUrl}/status`);
            if (response.ok) {
                return await response.json();
            }
            return { status: 'offline', port: 'unknown' };
        } catch (error) {
            return { status: 'offline', port: 'unknown' };
        }
    }
}

export const printerService = new PrinterService();
