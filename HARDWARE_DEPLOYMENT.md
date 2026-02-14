# Hardware Team: Raspberry Pi Deployment Guide

**For:** Hardware/EC Team  
**Time:** 30-45 minutes total

---

## ⚙️ What You Need (Hardware)

- ✅ Raspberry Pi 4 (4GB RAM) or Pi 5
- ✅ Official power adapter (5V 3A for Pi 4, 5V 5A for Pi 5) - **MUST USE OFFICIAL**
- ✅ 32GB microSD card (Class 10 or better)
- ✅ 7" touchscreen display
- ✅ USB keyboard + mouse (for setup)
- ✅ Internet connection (WiFi or Ethernet)

---

## 📦 DEPENDENCIES TO INSTALL

### System Dependencies (Install FIRST)

These are installed using `apt` (Debian package manager):

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install ALL dependencies in one command:
sudo apt install -y \
    python3.10 \
    python3.10-venv \
    python3-pip \
    nodejs \
    npm \
    git \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    libtesseract-dev \
    libleptonica-dev \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    chromium-browser \
    x11-xserver-utils \
    unclutter
```

**What this installs:**
- ✅ Python 3.10 (backend language)
- ✅ Node.js (frontend build tool)
- ✅ Git (to clone repository)
- ✅ Tesseract OCR (handwriting recognition)
- ✅ Chromium browser (to run the app)
- ✅ System libraries (required for graphics)

### Application Dependencies (Install SECOND)

These are installed automatically by our scripts:

**Frontend dependencies** (React, TypeScript, etc.):
- Installed by: `npm install` (happens in `./install.sh`)

**Backend dependencies** (FastAPI, Python packages):
- Installed by: `pip install -r requirements.txt` (happens in `./install.sh`)

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Flash Raspberry Pi OS

1. Download **Raspberry Pi Imager**: https://www.raspberrypi.com/software/
2. Flash **Raspberry Pi OS (64-bit)** to microSD card
3. Boot the Pi and complete initial setup

---

### Step 2: One-Click Setup (Recommended)

We have created a single script that installs all dependencies (System, Node.js, Python), builds the app, and configures the services automatically.

**Run these commands on your Pi:**

```bash
# 1. Clone the repository
cd ~
git clone https://github.com/siddhu2004bhagat/Muneem.git
cd Muneem

# 2. Run the Complete Setup Script
chmod +x setup_complete.sh
sudo ./setup_complete.sh
```

**What this script does:**
- ✅ Installs System Dependencies (Tesseract OCR, Python, etc.)
- ✅ Sets up Node.js 18+
- ✅ Builds the Frontend
- ✅ Sets up Backend & OCR Services
- ✅ Configures Kiosk Mode (Fullscreen)
- ✅ Auto-reboots the system

**Time:** ~15-20 minutes

---

### Step 3: Verify Installation (After Reboot)

The system will reboot automatically. When it comes back up, the application should launch in Kiosk mode.

To manually check services:
```bash
# Check service status
systemctl status muneem-backend
systemctl status muneem-ocr
systemctl status muneem-frontend
```

---

### Step 7: Test Application

Open Chromium browser:

```bash
chromium-browser http://localhost:5173
```

**Login with:**
- Username: `demo`
- PIN: `1234`

---

### Step 8: (Optional) Setup Auto-Start Kiosk Mode

For fullscreen mode that starts automatically on boot:

```bash
./scripts/start-kiosk.sh
```

To make it start on boot, create autostart file:

```bash
mkdir -p ~/.config/autostart
nano ~/.config/autostart/muneem.desktop
```

**Paste this:**
```ini
[Desktop Entry]
Type=Application
Name=MUNEEM Kiosk
Exec=/home/pi/DigBahi/scripts/start-kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## ✅ VERIFICATION CHECKLIST

Run this command to check everything:

```bash
./scripts/validate-pi-setup.sh
```

**Expected:** All checks pass with ✅

Manual checks:
- [ ] Login works (demo/1234)
- [ ] Dashboard loads
- [ ] Touch screen responds
- [ ] No lightning bolt icon (⚡) in top-right corner
- [ ] Temperature below 70°C: `vcgencmd measure_temp`

---

## 🔧 TROUBLESHOOTING

### Problem: "Port already in use"

```bash
./stop.sh
./start.sh
```

### Problem: Under-voltage warning (⚡ icon)

**Fix:** Use official Raspberry Pi power adapter only!

### Problem: Services won't start

```bash
# Check logs
cat /tmp/backend.log
cat /tmp/frontend.log
cat /tmp/ocr_service.log
```

### Problem: Touch screen not working

```bash
# Test touch
sudo apt install evtest
sudo evtest
# Select touch device and test
```

---

## 📝 QUICK COMMANDS

```bash
# Start application
./start.sh

# Stop application
./stop.sh

# Check if services running
curl http://localhost:8000/api/v1/health  # Backend
curl http://localhost:9000/health          # OCR
curl http://localhost:5173                 # Frontend

# View logs
cat /tmp/backend.log
cat /tmp/frontend.log

# Check temperature
vcgencmd measure_temp

# Check Pi model
cat /proc/device-tree/model
```

---

## 📋 DEPENDENCY SUMMARY

| Dependency | Version | Installed By | Purpose |
|------------|---------|--------------|---------|
| **Python** | 3.10+ | `apt` | Backend server |
| **Node.js** | 18+ | `apt` | Frontend build |
| **Tesseract OCR** | 5.x | `apt` | Handwriting recognition |
| **Chromium** | Latest | `apt` | Browser to run app |
| **Git** | Any | `apt` | Clone repository |
| **npm packages** | Various | `./install.sh` | Frontend dependencies |
| **Python packages** | Various | `./install.sh` | Backend dependencies |

---

## 🎯 INSTALLATION ORDER (IMPORTANT!)

```
1. Flash Raspberry Pi OS
         ↓
2. Install system dependencies (apt install...)
         ↓
3. Upgrade Node.js to v18+
         ↓
4. Clone repository (git clone...)
         ↓
5. Run ./install.sh (installs app dependencies)
         ↓
6. Run ./start.sh (starts services)
         ↓
7. Test in browser (localhost:5173)
         ↓
8. Setup kiosk mode (optional)
         ↓
9. DONE ✅
```

---

**Contact:**  
- GitHub: https://github.com/soni-pvt-ltd/DigBahi  
- Email: support@muneem.in

**Last Updated:** February 13, 2026
