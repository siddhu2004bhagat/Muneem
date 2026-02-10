/**
 * ESC/POS Command Builder for Thermal Printers
 * Handles text encoding, formatting, and control commands.
 */

export class ESCPOS {
    private buffer: number[] = [];

    constructor() {
        this.reset();
    }

    // Initialize printer
    reset(): ESCPOS {
        this.buffer.push(0x1B, 0x40); // ESC @
        return this;
    }

    // Text formatting
    align(align: 'left' | 'center' | 'right'): ESCPOS {
        const n = align === 'center' ? 1 : align === 'right' ? 2 : 0;
        this.buffer.push(0x1B, 0x61, n);
        return this;
    }

    bold(active: boolean): ESCPOS {
        this.buffer.push(0x1B, 0x45, active ? 1 : 0);
        return this;
    }

    // Text output
    text(content: string): ESCPOS {
        // Simple ASCII encoding for now. 
        // For proper UTF-8/International support, we'd need a mapping table (e.g. PC437/PC850)
        // or use the printer's specific code page commands.
        // This handles basic Latin text.
        for (let i = 0; i < content.length; i++) {
            const code = content.charCodeAt(i);
            // Replace non-ascii with ? to prevent garbage printing
            this.buffer.push(code > 127 ? 63 : code);
        }
        return this;
    }

    textLine(content: string): ESCPOS {
        return this.text(content).feed(1);
    }

    // Feed control
    feed(n: number = 1): ESCPOS {
        for (let i = 0; i < n; i++) {
            this.buffer.push(0x0A); // LF
        }
        return this;
    }

    // Cut paper
    cut(): ESCPOS {
        this.buffer.push(0x1D, 0x56, 66, 0); // GS V B 0 (Partial Cut)
        return this;
    }

    // Get raw data for WebUSB
    encode(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    // Custom separator line
    separator(): ESCPOS {
        return this.textLine('-'.repeat(32)); // 32 chars for 58mm/48mm print width
    }
}
