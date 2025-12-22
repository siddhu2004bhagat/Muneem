# Linux Tablet Specifications for DigBahi Software

## 📋 Overview
This document specifies the exact hardware and software requirements for a Linux-based tablet to run DigBahi accounting software optimally.

---

## 🎯 Critical Requirements Based on Software Analysis

### **1. Processor (CPU) - CRITICAL**

#### **Minimum Required:**
- **Architecture:** ARM64 (ARMv8-A or higher)
- **Cores:** Quad-core minimum
- **Clock Speed:** 1.5 GHz per core minimum
- **Type:** ARM Cortex-A55 or better (e.g., Cortex-A75, Cortex-A76, Cortex-A78)

#### **Recommended:**
- **Architecture:** ARM64
- **Cores:** Octa-core (4+4 big.LITTLE or 8x performance cores)
- **Clock Speed:** 2.0 GHz+ per core
- **Type:** ARM Cortex-A75/A76/A78 or MediaTek Helio G series

**Why:**
- OCR processing (Tesseract.js + TensorFlow Lite) requires multi-core processing
- Target: < 3 seconds recognition latency
- Canvas rendering at 60fps needs CPU power
- Backend Python services (FastAPI + Tesseract OCR) need CPU resources

---

### **2. Memory (RAM) - CRITICAL**

#### **Minimum Required:**
- **Total RAM:** 3GB system RAM
- **Available for App:** 2GB free (after OS)
- **Browser Memory:** ~500MB-800MB
- **OCR Worker Memory:** < 150MB (peak)

#### **Recommended:**
- **Total RAM:** 4GB system RAM
- **Available for App:** 3GB+ free
- **Browser Memory:** ~800MB-1.2GB
- **OCR Worker Memory:** < 150MB (peak)

**Why:**
- Linux OS: ~500MB-1GB
- Browser (Chromium): ~500MB-800MB
- Frontend React app: ~100MB-200MB
- OCR processing: ~150MB peak
- Backend Python services: ~200MB-300MB
- IndexedDB operations: ~50MB-100MB
- **Total needed: ~2.5GB-3GB minimum**

---

### **3. Graphics (GPU) - IMPORTANT**

#### **Minimum Required:**
- **Type:** Mali-G52 or better
- **OpenGL ES:** 3.0+ support
- **WebGL:** 2.0 support (for canvas acceleration)
- **Hardware Acceleration:** Required for smooth canvas rendering

#### **Recommended:**
- **Type:** Mali-G76 or better
- **OpenGL ES:** 3.2+ support
- **WebGL:** 2.0 support
- **Hardware Acceleration:** Full support

**Why:**
- Canvas rendering at 60fps requires GPU acceleration
- Device Pixel Ratio (DPR) scaling needs GPU
- Smooth pen input rendering (quadratic curves, Bezier interpolation)
- Tested on: "Linux ARM tablets (Mali GPU)" - from your code

---

### **4. Storage - IMPORTANT**

#### **Minimum Required:**
- **Internal Storage:** 16GB eMMC
- **Free Space:** 8GB+ after OS installation
- **App Storage:** ~500MB (frontend + backend)
- **Data Storage:** IndexedDB (browser-based, encrypted)

#### **Recommended:**
- **Internal Storage:** 32GB+ eMMC
- **Free Space:** 20GB+ after OS installation
- **Expandable:** microSD card slot (for backups)

**Why:**
- Linux OS: ~3GB-5GB
- Node.js + Python: ~500MB-1GB
- Browser cache: ~500MB-1GB
- Tesseract OCR models: ~50MB-100MB
- TensorFlow Lite models: ~10MB-20MB
- User data (IndexedDB): Variable (encrypted, local-only)
- **Total needed: ~8GB-10GB minimum**

---

### **5. Display - CRITICAL**

#### **Minimum Required:**
- **Size:** 8" diagonal minimum
- **Resolution:** 1280x800 (HD) minimum
- **Type:** IPS LCD
- **Touch:** Capacitive multi-touch (5-point minimum)
- **DPI:** 150+ DPI
- **Aspect Ratio:** 16:10 or 4:3

#### **Recommended:**
- **Size:** 10.1" diagonal
- **Resolution:** 1920x1200 (Full HD) or 1280x800 (HD)
- **Type:** IPS LCD with good viewing angles
- **Touch:** Capacitive multi-touch (10-point)
- **DPI:** 200+ DPI
- **Aspect Ratio:** 16:10 (better for writing)

**Why:**
- Canvas height: 15,000px (configurable, for scrolling)
- Canvas width: Viewport width (responsive)
- Device Pixel Ratio (DPR) support: 1x, 2x, 3x
- Clear text rendering for OCR (minimum 300 DPI equivalent for best results)
- Comfortable writing area for handwriting recognition

---

### **6. Input - IMPORTANT**

#### **Minimum Required:**
- **Touch:** Capacitive multi-touch
- **Stylus:** Passive stylus support (optional)
- **Pressure Sensitivity:** Not required (simulated from touch area)

#### **Recommended:**
- **Touch:** Capacitive multi-touch (10-point)
- **Stylus:** Active pen support (pressure-sensitive)
- **Palm Rejection:** Hardware or software-based

**Why:**
- Pen input tool requires smooth touch tracking
- Pressure simulation from touch width/height
- Two-finger scrolling support (for canvas navigation)
- Single-finger drawing (for pen tool)

---

### **7. Operating System - CRITICAL**

#### **Required:**
- **OS:** Linux-based (Ubuntu Touch, postmarketOS, Manjaro ARM, or Debian ARM)
- **Kernel:** Linux 5.10+ (for modern hardware support)
- **Architecture:** ARM64 (aarch64)

#### **Recommended:**
- **OS:** Ubuntu Touch or postmarketOS
- **Kernel:** Linux 5.15+ or 6.x
- **Package Manager:** apt (Debian-based) or pacman (Arch-based)

**Why:**
- Backend requires Python 3.8+ (available in Linux repos)
- Tesseract OCR installation (system package)
- Node.js 18+ installation (for local development, optional)
- Browser support (Chromium/Firefox)

---

### **8. Browser - CRITICAL**

#### **Required:**
- **Browser:** Chromium 90+ or Firefox 88+
- **Features Required:**
  - IndexedDB support (for local storage)
  - Web Workers (for OCR processing)
  - WebAssembly (for TensorFlow Lite)
  - Canvas API (for drawing)
  - WebGL 2.0 (for GPU acceleration)
  - Service Workers (for offline mode)

#### **Recommended:**
- **Browser:** Chromium 100+ (latest stable)
- **Features:** All modern web APIs

**Why:**
- Your software is a web app (React + Vite)
- IndexedDB for encrypted local storage
- Web Workers for non-blocking OCR
- WebAssembly for TensorFlow Lite models
- Canvas API for pen input rendering

---

### **9. Connectivity - IMPORTANT**

#### **Minimum Required:**
- **WiFi:** 802.11n (WiFi 4) minimum
- **Bluetooth:** 4.2+ (optional, for data sync)

#### **Recommended:**
- **WiFi:** 802.11ac (WiFi 5) or 802.11ax (WiFi 6)
- **Bluetooth:** 5.0+ (for accessories)
- **USB:** USB-C or micro-USB (for charging + data)

**Why:**
- Initial app installation (if hosted)
- Data backup/restore (optional)
- Updates (if using hosted version)
- **Note:** App works fully offline (IndexedDB)

---

### **10. Battery - IMPORTANT**

#### **Minimum Required:**
- **Capacity:** 4000mAh
- **Runtime:** 4-6 hours continuous use

#### **Recommended:**
- **Capacity:** 6000mAh+
- **Runtime:** 8-10 hours continuous use
- **Charging:** USB-C fast charging

**Why:**
- OCR processing is CPU-intensive
- Canvas rendering uses GPU (power consumption)
- All-day usage requirement for business use

---

## 📊 Performance Benchmarks (Target)

Based on your software requirements:

| Metric | Target | Minimum Acceptable |
|--------|--------|-------------------|
| **OCR Recognition** | < 3 seconds | < 5 seconds |
| **Canvas FPS** | 60fps | 50fps |
| **App Load Time** | < 3 seconds | < 5 seconds |
| **Memory Usage (Peak)** | < 150MB (OCR) | < 200MB (OCR) |
| **Touch Latency** | < 16ms | < 33ms |
| **IndexedDB Write** | < 50ms | < 100ms |

---

## 🎯 Recommended Tablet Specifications Summary

### **Ideal Configuration:**

```
Processor:     Octa-core ARM Cortex-A75/A76 (2.0GHz+)
RAM:           4GB LPDDR4
Storage:       32GB eMMC + microSD slot
Display:       10.1" IPS 1920x1200 (or 1280x800)
GPU:           Mali-G76 or better
OS:            Ubuntu Touch or postmarketOS
Browser:       Chromium 100+
Touch:         Capacitive 10-point
Battery:       6000mAh+
Connectivity:  WiFi 5, Bluetooth 5.0
```

### **Minimum Viable Configuration:**

```
Processor:     Quad-core ARM Cortex-A55 (1.5GHz+)
RAM:           3GB LPDDR3
Storage:       16GB eMMC
Display:       8" IPS 1280x800
GPU:           Mali-G52
OS:            Ubuntu Touch or postmarketOS
Browser:       Chromium 90+
Touch:         Capacitive 5-point
Battery:       4000mAh
Connectivity:  WiFi 4, Bluetooth 4.2
```

---

## 🔧 Software Installation Requirements

### **System Packages Needed:**
```bash
# Python 3.8+
python3 python3-pip python3-venv

# Tesseract OCR
tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin

# Node.js 18+ (optional, for local dev)
nodejs npm

# Browser
chromium-browser  # or firefox

# System libraries
libgl1 libglib2.0-0
```

### **Backend Dependencies:**
- Python 3.8+
- FastAPI 0.104.1+
- Tesseract OCR (system package)
- OpenCV (Python package)
- Pillow (Python package)

---

## ✅ Compatibility Checklist

Before purchasing, verify:

- [ ] ARM64 (aarch64) architecture
- [ ] 3GB+ RAM (4GB recommended)
- [ ] 16GB+ storage (32GB recommended)
- [ ] Mali GPU (G52 or better)
- [ ] Linux OS support (Ubuntu Touch/postmarketOS)
- [ ] Chromium browser available
- [ ] 8"+ display (10" recommended)
- [ ] Capacitive touch (multi-touch)
- [ ] Active community support (for Linux installation)

---

## 📝 Notes

1. **Web App Architecture:** Your software runs in a browser, so any Linux tablet with Chromium will work
2. **Offline-First:** All data stored locally (IndexedDB), no internet required
3. **ARM-Optimized:** Your OCR models are optimized for ARM processors
4. **Tested Configuration:** Code mentions "Linux ARM tablets (Mali GPU)" - this is your target
5. **Performance:** Target < 3 seconds OCR, 60fps canvas rendering

---

## 🎯 Final Recommendation

**Best Match:** PineTab 2 or similar ARM tablet with:
- Rockchip RK3566 (Quad-core Cortex-A55) or better
- 4GB RAM
- 64GB storage
- 10.1" display
- Mali-G52 GPU
- Ubuntu Touch pre-installed

This configuration will provide optimal performance for your DigBahi software.


