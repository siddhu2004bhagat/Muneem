import serial
import os
import base64
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Robustly find the .env file
# Logic: backend/app/services/printer_service.py -> ../../../.env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)

class SerialPrinter:
    def __init__(self):
        self.port = os.getenv("PRINTER_PORT", "/dev/serial0")
        self.baudrate = int(os.getenv("PRINTER_BAUDRATE", "9600"))
        self.last_error = None
        
        print(f"🖨️ Printer Service Config: Port={self.port}, Baud={self.baudrate}, EnvFile={ENV_PATH}")

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
            self.last_error = None
            return True
        except serial.SerialException as e:
            self.last_error = str(e)
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
            self.last_error = str(e)
            print(f"Print error: {e}")
            return False
            
    def status(self) -> dict:
        """Check printer connection status."""
        is_connected = False
        error_msg = self.last_error
        
        try:
            # Check if existing connection is alive
            if self._connection and self._connection.is_open:
                is_connected = True
            else:
                 # Quick verify without locking effectively
                 try:
                     with serial.Serial(self.port, self.baudrate, timeout=0.1):
                         is_connected = True
                         error_msg = None
                 except Exception as e:
                     error_msg = str(e)
                     # Don't print constantly to logs, just return in API
        except Exception as e:
            is_connected = False
            error_msg = str(e)
            
        return {
            "status": "online" if is_connected else "offline",
            "port": self.port,
            "baudrate": self.baudrate,
            "error": error_msg
        }

printer_service = SerialPrinter()
