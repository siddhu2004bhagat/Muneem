# Raspberry Pi 5 Setup Guide for DigiBahi

This guide provides step-by-step instructions to set up the environment and run the DigiBahi application on a Raspberry Pi 5.

## 1. Prerequisites

Before starting, ensure your Raspberry Pi 5 is:
- **Updated:** Run `sudo apt update && sudo apt upgrade -y`
- **Connected** to the internet

### Install Node.js & npm (via NVM)
The recommended way to install Node.js is using NVM (Node Version Manager).

1.  **Install curl:**
    ```bash
    sudo apt install curl -y
    ```

2.  **Install NVM:**
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    ```

3.  **Activate NVM:**
    Close and reopen your terminal, or run:
    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    ```

4.  **Install Node.js (LTS):**
    ```bash
    nvm install --lts
    nvm use --lts
    ```

5.  **Verify installation:**
    ```bash
    node -v
    npm -v
    ```

### Install Git
1.  **Install git:**
    ```bash
    sudo apt install git -y
    ```

2.  **Configure Git:**
    ```bash
    git config --global user.name "Your Name"
    git config --global user.email "your.email@example.com"
    ```

## 2. Cloning the Repository

1.  **Navigate to your desired directory (e.g., home):**
    ```bash
    cd ~
    ```

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/soni-pvt-ltd/DigBahi.git
    ```

3.  **Enter the project directory:**
    ```bash
    cd DigBahi
    ```

4.  **Checkout the correct branch (if needed):**
    ```bash
    git checkout cleanup/remove-paddle-refs
    # Or use main if you've merged: git checkout main
    ```

## 3. Installing Dependencies

The repository includes a helper script to install all dependencies (Frontend + Backend + OCR).

1.  **Make the script executable:**
    ```bash
    chmod +x install.sh
    ```

2.  **Run the installation script:**
    ```bash
    ./install.sh
    ```
    *Note: This will install Node modules and set up Python virtual environments for the backend and OCR service.*

## 4. Running the Application

The repository includes a `start.sh` script to launch all services (Frontend, Backend, OCR) simultaneously.

1.  **Make the script executable:**
    ```bash
    chmod +x start.sh stop.sh
    ```

2.  **Start the application:**
    ```bash
    ./start.sh
    ```
    This will start:
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:8000`
    - OCR Service: `http://localhost:9000`

3.  **Accessing from other devices (e.g., iPad):**
    - The script will print your LAN IP address (e.g., `http://192.168.1.100:5173`).
    - Open that URL on your iPad connected to the same Wi-Fi.

### Option: Run manually (if scripts fail)

**Frontend:**
```bash
npm run dev -- --host
```

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

**OCR Service:**
```bash
cd backend/services/tesseract_ocr
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn ocr_service:app --host 0.0.0.0 --port 9000
```

## 5. Automation (Optional)

To run the app automatically on boot, you can use PM2.

1.  **Install PM2:**
    ```bash
    npm install -g pm2
    ```

2.  **Start the app with PM2:**
    ```bash
    pm2 start "npm run dev -- --host" --name "digibahi"
    ```

3.  **Save the process list:**
    ```bash
    pm2 save
    ```

4.  **Setup startup script:**
    ```bash
    pm2 startup
    ```
    (Follow the instructions provided by the command output)
