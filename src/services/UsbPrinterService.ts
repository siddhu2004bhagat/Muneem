/**
 * USB Printer Service using WebUSB API
 * Handles connection, data transfer, and device management.
 */

export class UsbPrinterService {
    private device: USBDevice | null = null;
    private interfaceNumber: number = 0;
    private endpointOut: number = 1;

    async connect(): Promise<boolean> {
        try {
            // 1. Request Device
            // Filters for common printer classes (0x07 = Printer)
            // Or specific device filters if known.
            this.device = await navigator.usb.requestDevice({
                filters: [{ classCode: 7 }]
            });

            // 2. Open Device
            await this.device.open();

            // 3. Select Configuration
            if (this.device.configuration === null) {
                await this.device.selectConfiguration(1);
            }

            // 4. Claim Interface
            // Usually interface 0 for simple USB printers
            // We might need to iterate interfaces to find the bulk OUT endpoint
            const interfaces = this.device?.configuration?.interfaces || [];
            const printerInterface = interfaces.find(i =>
                i.alternates[0].endpoints.some(e => e.direction === 'out' && e.type === 'bulk')
            );

            if (!printerInterface) {
                throw new Error('No compatible bulk OUT interface found.');
            }

            this.interfaceNumber = printerInterface.interfaceNumber;

            // Find the endpoint number
            const endpoint = printerInterface.alternates[0].endpoints.find(e => e.direction === 'out' && e.type === 'bulk');
            if (endpoint) {
                this.endpointOut = endpoint.endpointNumber;
            }

            await this.device.claimInterface(this.interfaceNumber);

            return true;
        } catch (error) {
            console.error('USB Printer Connection Failed:', error);
            return false;
        }
    }

    async print(data: Uint8Array): Promise<boolean> {
        if (!this.device || !this.device.opened) {
            console.error('Printer not connected');
            return false;
        }

        try {
            await this.device.transferOut(this.endpointOut, data as unknown as BufferSource);
            return true;
        } catch (error) {
            console.error('Print Failed:', error);
            return false;
        }
    }

    async disconnect() {
        if (this.device) {
            try {
                await this.device.close();
            } catch (e) {
                console.warn('Error closing device:', e);
            }
            this.device = null;
        }
    }

    isConnected(): boolean {
        return this.device !== null && this.device.opened;
    }
}

export const usbPrinter = new UsbPrinterService();
