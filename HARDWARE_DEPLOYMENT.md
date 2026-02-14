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

### Step 2: Install System Dependencies

**Copy and paste this ONE command:**

```bash
sudo apt update && sudo apt install -y \
    python3.10 python3.10-venv python3-pip nodejs npm git \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin \
    libtesseract-dev libleptonica-dev build-essential \
    libgl1-mesa-glx libglib2.0-0 chromium-browser \
    x11-xserver-utils unclutter
```

**Time:** 10-15 minutes

---

### Step 3: Upgrade Node.js to Version 18+

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify version (should be 18.x.x or higher)
node --version
```

---

### Step 4: Clone Repository

```bash
# Go to home directory
cd ~

# Clone the project
git clone https://github.com/soni-pvt-ltd/DigBahi.git

# Enter project directory
cd DigBahi
```

**If repository is private, you'll be asked for username/password**

---

### Step 5: Run Installation Script

This installs all application dependencies automatically:

```bash
./install.sh
```

**What it does:**
- ✅ Installs frontend dependencies (npm packages)
- ✅ Creates Python virtual environment
- ✅ Installs backend dependencies (Python packages)
- ✅ Configures OCR service

**Time:** 10-15 minutes

**Expected output at the end:**
```
╔════════════════════════════════════════╗
║   ✅ Installation Complete!           ║
╚════════════════════════════════════════╝
```

---

### Step 6: Start Application

```bash
./start.sh
```

**Time:** 10-20 seconds

**Expected output:**
```
✅ Backend API: http://localhost:8000 - Ready
✅ Tesseract OCR: http://localhost:9000 - Ready
✅ Frontend: http://localhost:5173 - Ready
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
