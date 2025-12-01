# DigiBahi - System Workflow for EC Team

**Hardware-Software Integration Flow**

---

## 🔄 COMPLETE SYSTEM WORKFLOW

### **1. User Interaction Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (SME Owner/Accountant)               │
│  - Opens application on 7" touchscreen tablet               │
│  - Uses finger or stylus for input                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              HARDWARE LAYER (Raspberry Pi 4/5)              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 7" Touchscreen│  │ Raspberry Pi │  │ Power Supply │     │
│  │  (Capacitive) │  │   (4GB RAM)  │  │  (5V 3A/5A) │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         │ HDMI + USB       │                  │             │
│         └──────────────────┘                  │             │
│                  │                            │             │
│                  └────────────────────────────┘             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              SOFTWARE LAYER (Linux OS)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chromium Browser (Kiosk Mode)                        │  │
│  │  - Fullscreen display                                 │  │
│  │  - Touch input handling                               │  │
│  │  - React Frontend (Port 5173)                         │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  FastAPI Backend (Port 8000)                          │  │
│  │  - REST API endpoints                                 │  │
│  │  - SQLite database                                    │  │
│  │  - Business logic                                     │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  OCR Service (Port 9000)                             │  │
│  │  - Tesseract OCR engine                               │  │
│  │  - Handwriting recognition                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 DETAILED WORKFLOW: ACCOUNTING ENTRY

### **Scenario: User writes "Sale ₹5000 2025-01-21" on screen**

#### **Step 1: User Input (Hardware)**
```
User touches screen with stylus/finger
    ↓
Touchscreen captures touch coordinates
    ↓
USB touch data → Raspberry Pi
    ↓
Chromium browser receives touch events
```

#### **Step 2: Drawing Capture (Software)**
```
Browser Canvas API captures strokes
    ↓
Strokes stored in memory (HTML5 Canvas)
    ↓
User clicks "Recognize" button
```

#### **Step 3: OCR Processing (Software → Hardware)**
```
Canvas image → Base64 encoded
    ↓
POST request → Backend OCR Service (Port 9000)
    ↓
Python processes image with Tesseract
    ↓
CPU intensive: Raspberry Pi processes OCR
    ↓
Returns: "Sale ₹5000 2025-01-21"
```

#### **Step 4: Data Processing (Software)**
```
OCR text → Frontend React component
    ↓
Text parsing: Extract amount, date, type
    ↓
Form auto-filled with parsed data
    ↓
User reviews and confirms
```

#### **Step 5: Data Storage (Software → Hardware)**
```
Form data → Backend API (Port 8000)
    ↓
SQLite database write (on SD card/SSD)
    ↓
IndexedDB cache (browser storage)
    ↓
Data persisted locally
```

---

## 🔌 HARDWARE-SOFTWARE INTERACTION POINTS

### **1. Touch Input**
```
Touchscreen (Hardware)
    ↓ USB/SPI
Raspberry Pi GPIO/USB (Hardware)
    ↓ Linux Input Driver
Chromium Browser (Software)
    ↓ JavaScript Events
React Canvas Component (Software)
```

### **2. Display Output**
```
React UI (Software)
    ↓ HTML5 Canvas
Chromium Browser (Software)
    ↓ HDMI Signal
Raspberry Pi HDMI Port (Hardware)
    ↓ HDMI Cable
7" Touchscreen Display (Hardware)
```

### **3. OCR Processing**
```
Canvas Image (Software)
    ↓ HTTP POST
Backend OCR Service (Software)
    ↓ Python PIL/Tesseract
CPU Processing (Hardware - Raspberry Pi)
    ↓ OCR Result
Frontend Display (Software)
```

### **4. Data Storage**
```
Form Data (Software)
    ↓ SQLite Write
SD Card / SSD (Hardware)
    ↓ File System
Database File (Hardware Storage)
```

---

## ⚡ POWER & PERFORMANCE FLOW

### **Power Consumption**
```
Power Supply (5V 3A/5A)
    ↓
Raspberry Pi (Base: ~1.5W idle, ~5W active)
    ↓
+ Display Backlight (~2-3W)
+ CPU Load (OCR: +2-3W peak)
    ↓
Total: ~8-11W during OCR processing
```

### **Performance Bottlenecks**
```
1. OCR Processing (CPU intensive)
   - Tesseract uses 1-2 CPU cores
   - Processing time: 2-5 seconds per image
   - Memory: ~200MB during OCR

2. Database Writes (I/O)
   - SD card speed critical
   - SSD recommended for better performance
   - Write latency: 10-50ms per entry

3. Display Refresh
   - 60fps UI updates
   - Touch response: <100ms
```

---

## 🔄 COMPLETE USER JOURNEY

### **Accounting Entry Workflow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. STARTUP                                                  │
│    - Raspberry Pi boots                                      │
│    - Linux OS loads                                          │
│    - Services start (Backend, OCR, Frontend)                 │
│    - Chromium opens in kiosk mode                           │
│    - Application loads (3-5 seconds)                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER LOGIN                                               │
│    - Touch PIN pad on screen                                 │
│    - PIN verified locally                                    │
│    - Dashboard displayed                                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CREATE ENTRY (Pen Input Method)                          │
│                                                              │
│    a) User clicks "Pen Input" button                        │
│       → Touch event → React handler                         │
│                                                              │
│    b) Canvas opens (fullscreen drawing area)                │
│       → Touch coordinates → Canvas strokes                  │
│                                                              │
│    c) User writes: "Sale ₹5000 2025-01-21"                 │
│       → Strokes stored in memory                            │
│                                                              │
│    d) User clicks "Recognize"                               │
│       → Canvas → Base64 image                               │
│       → HTTP POST → Backend OCR (Port 9000)                │
│       → Tesseract processes (2-5 seconds)                    │
│       → Returns: "Sale ₹5000 2025-01-21"                    │
│                                                              │
│    e) Text displayed in correction overlay                   │
│       → User reviews/edits if needed                        │
│       → Clicks "Confirm"                                     │
│                                                              │
│    f) Text parsed:                                          │
│       - Type: "Sale"                                         │
│       - Amount: ₹5000                                       │
│       - Date: 2025-01-21                                    │
│                                                              │
│    g) Form auto-filled                                      │
│       → User reviews → Clicks "Save"                        │
│                                                              │
│    h) Data saved:                                           │
│       → Backend API (Port 8000)                             │
│       → SQLite database write                               │
│       → IndexedDB cache update                              │
│       → Success message displayed                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. VIEW REPORTS                                             │
│    - User clicks "Reports" tab                              │
│    - Backend queries SQLite database                        │
│    - Data aggregated (CPU processing)                       │
│    - Charts/graphs rendered                                 │
│    - User can export PDF/CSV                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ HARDWARE REQUIREMENTS BREAKDOWN

### **For Each Component:**

#### **1. Raspberry Pi 4/5**
- **Role:** Main computing unit
- **Load:** 
  - Base OS: 20% CPU, 500MB RAM
  - Backend API: 10% CPU, 150MB RAM
  - OCR Service: 50-80% CPU (during OCR), 200MB RAM
  - Frontend Browser: 20% CPU, 300MB RAM
- **Total:** ~4GB RAM needed, Quad-core CPU

#### **2. 7" Touchscreen**
- **Role:** Input/Output interface
- **Requirements:**
  - Capacitive (multi-touch)
  - 1024x600 minimum resolution
  - HDMI input
  - USB touch controller
  - Brightness: 300+ nits

#### **3. Power Supply**
- **Role:** Stable power delivery
- **Critical:** Must provide consistent 5V
- **Load:** 8-11W peak during OCR
- **Requirement:** Official Pi adapter (quality matters)

#### **4. Storage (SD Card/SSD)**
- **Role:** OS + Application + Database
- **Read/Write:** 
  - OS boot: Read-heavy
  - Database: Write-heavy (every entry)
  - OCR models: Read on startup
- **Requirement:** Class 10, UHS-I minimum (SSD preferred)

---

## 🔧 TECHNICAL SPECIFICATIONS FOR EC TEAM

### **Interfaces Required:**

1. **HDMI Interface**
   - Type: Micro HDMI (Pi 4) or Standard HDMI (Pi 5)
   - Resolution: 1024x600 @ 60Hz minimum
   - Cable: Short, high-quality

2. **USB Interface**
   - Type: USB 2.0 minimum
   - Purpose: Touch input data
   - Bandwidth: Low (touch coordinates only)

3. **Power Interface**
   - Type: USB-C (Pi 4/5)
   - Voltage: 5V ±5%
   - Current: 3A (Pi 4) / 5A (Pi 5)
   - Regulation: Critical (voltage drops cause crashes)

4. **Storage Interface**
   - Type: MicroSD slot (Pi 4/5)
   - Alternative: USB 3.0 SSD (better performance)
   - Speed: UHS-I minimum

---

## 📊 PERFORMANCE METRICS

### **Expected Performance (Pi 4, 4GB RAM):**

| Operation | Time | Hardware Load |
|-----------|------|---------------|
| **App Startup** | 3-5 sec | CPU: 50%, RAM: 1GB |
| **OCR Recognition** | 2-5 sec | CPU: 70-80%, RAM: +200MB |
| **Form Save** | 100-500ms | CPU: 10%, I/O: Write |
| **Report Generation** | 1-3 sec | CPU: 30%, RAM: +100MB |

### **Memory Usage:**
- **Idle:** ~1.5GB used
- **Active (OCR):** ~2.5GB used
- **Peak:** ~3GB used
- **Available:** 1GB buffer (safety margin)

---

## 🚨 CRITICAL HARDWARE CONSIDERATIONS

### **1. Power Stability**
- **Issue:** Voltage drops cause system crashes
- **Solution:** Official Pi power adapter, quality USB-C cable
- **Monitoring:** Pi has under-voltage detection

### **2. Thermal Management**
- **Issue:** Pi 5 throttles at 80°C
- **Solution:** Heat sink + fan (Pi 5), passive cooling (Pi 4)
- **Monitoring:** CPU temperature in health endpoint

### **3. Storage Reliability**
- **Issue:** SD card corruption from power loss
- **Solution:** Quality SD card, SSD preferred, proper shutdown
- **Mitigation:** Database writes are atomic

### **4. Touch Calibration**
- **Issue:** Touch coordinates may be offset
- **Solution:** Calibration tool (`xinput_calibrator`)
- **Setup:** One-time calibration on first boot

---

## 🔄 STARTUP SEQUENCE (Hardware Perspective)

```
1. Power On
   → Power supply provides 5V
   → Raspberry Pi boots
   → SD card read (OS loading)

2. OS Boot (30-60 seconds)
   → Linux kernel loads
   → Services start
   → Network initialized

3. Application Start (5-10 seconds)
   → Backend API starts (Port 8000)
   → OCR Service starts (Port 9000)
   → Frontend builds (Port 5173)

4. Display Ready
   → Chromium launches
   → Kiosk mode activated
   → Application UI displayed

5. Ready for Use
   → Touch input active
   → All services healthy
   → User can interact
```

---

## 📋 HARDWARE TESTING CHECKLIST

For EC team to verify:

- [ ] Power supply provides stable 5V under load
- [ ] Touchscreen responds to finger and stylus
- [ ] Display shows full UI without clipping
- [ ] HDMI connection stable (no flickering)
- [ ] USB touch input works correctly
- [ ] SD card/SSD read/write speeds adequate
- [ ] System doesn't crash during OCR processing
- [ ] Temperature stays below 70°C (Pi 4) / 80°C (Pi 5)
- [ ] No under-voltage warnings
- [ ] All services start within 60 seconds
- [ ] Touch calibration accurate
- [ ] Display brightness adjustable

---

**Last Updated:** 2025-01-21  
**For:** EC Hardware Team

