import serial
import os
import base64
from typing import Optional

from dotenv import load_dotenv

# Explicitly load .env from backend root
# working directory is usually backend/ so .env is in CWD
load_dotenv()

class SerialPrinter:
    def __init__(self):
        self.port = os.getenv("PRINTER_PORT", "/dev/serial0")
        self.baudrate = int(os.getenv("PRINTER_BAUDRATE", "9600"))
        
        print(f"🖨️ Printer Service Config: Port={self.port}, Baud={self.baudrate}") # Debug log

        self.timeout = 1
        self._connection: Optional[serial.Serial] = None

    def connect(self) -> bool:
        """Establish connection to the serial port."""
        try:
            if self._connection and self._connection.is_open:
                return True
                
            self._connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout
            )
            return True
        except serial.SerialException as e:
            print(f"Failed to connect to printer on {self.port}: {e}")
            return False

    def print_raw(self, base64_data: str) -> bool:
        """Decode base64 data and send bytes to the printer."""
        try:
            if not self.connect():
                return False
            
            data = base64.b64decode(base64_data)
            if self._connection:
                self._connection.write(data)
                return True
            return False
        except Exception as e:
            print(f"Print error: {e}")
            return False
            
    def status(self) -> dict:
        """Check printer connection status."""
        is_connected = False
        try:
            # Try to open if not open, but don't force it if it's potentially busy or missing
            if self._connection and self._connection.is_open:
                is_connected = True
            else:
                 # Quick check without holding the port
                 with serial.Serial(self.port, self.baudrate, timeout=0.1):
                     is_connected = True
        except:
            is_connected = False
            
        return {
            "status": "online" if is_connected else "offline",
            "port": self.port
        }

printer_service = SerialPrinter()
