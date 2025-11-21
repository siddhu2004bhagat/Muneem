# DigBahi - Folder Structure

**Last Cleaned**: Current  
**Status**: ✅ Clean and Well-Organized

---

## Root Directory

### Documentation Files

- `README.md` - Main project documentation
- `ARCHITECTURE.md` - System architecture overview
- `WHATSAPP_INTEGRATION.md` - WhatsApp integration guide (consolidated)
- `WHATSAPP_API_INTEGRATION_GUIDE.md` - Detailed API integration guide
- `WHATSAPP_TEMPLATE_SETUP.md` - Template setup instructions
- `CLEANUP_SUMMARY.md` - Cleanup history

### Configuration Files

- `package.json` - Node.js dependencies
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - Shadcn UI configuration
- `.gitignore` - Git ignore rules

### Scripts

- `start.sh` - Start all services
- `stop.sh` - Stop all services

---

## Source Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   ├── forms/         # Form components
│   └── dashboard/     # Dashboard components
│
├── features/          # Feature-based modules
│   ├── payments/     # Payment integrations (WhatsApp, UPI)
│   ├── pen-input/    # Pen input functionality
│   ├── reports/      # Reporting features
│   ├── inventory/    # Inventory management
│   └── settings/     # Settings
│
├── services/         # Business logic services
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── pages/           # Page components
└── types/           # TypeScript type definitions
```

---

## Backend Structure

```
backend/
├── app/
│   ├── api/v1/      # API endpoints
│   ├── services/    # Business logic services
│   ├── db/          # Database models and schemas
│   └── ai/          # AI/ML modules
│
├── services/
│   └── paddle_ocr/  # OCR service
│
├── tests/           # Test files
├── requirements.txt # Python dependencies
└── .env            # Environment variables (not in git)
```

---

## Cleanup Status

### ✅ Completed

- **Documentation**: Consolidated 8 WhatsApp docs into 3 essential files
- **Python Cache**: Removed all `__pycache__` directories
- **Compiled Files**: Removed all `.pyc` files
- **Test Cache**: Removed `.pytest_cache` directories
- **Gitignore**: Updated to exclude cache files

### Files Removed

- `WHATSAPP_ANALYSIS_FINAL.md` (consolidated)
- `WHATSAPP_COMPLETE_ANALYSIS.md` (consolidated)
- `WHATSAPP_DEEP_VALIDATION_FINAL.md` (consolidated)
- `WHATSAPP_VALIDATION_FINAL.md` (consolidated)
- `WHATSAPP_INTEGRATION_COMPLETE.md` (consolidated)
- `WHATSAPP_FIXES_APPLIED.md` (consolidated)
- All `__pycache__/` directories
- All `*.pyc` files
- All `.pytest_cache/` directories

### Files Kept

- `WHATSAPP_INTEGRATION.md` - Main integration guide
- `WHATSAPP_API_INTEGRATION_GUIDE.md` - Detailed API guide
- `WHATSAPP_TEMPLATE_SETUP.md` - Template setup instructions

---

## Maintenance

### Regular Cleanup

Run these commands periodically:

```bash
# Remove Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null

# Remove test cache
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null
```

### Gitignore Coverage

The `.gitignore` file excludes:
- `__pycache__/`
- `*.pyc`
- `.pytest_cache/`
- `venv/`
- `.env`
- `node_modules/`
- `dist/`
- `build/`

---

**Status**: ✅ Clean and Well-Organized  
**Last Updated**: Current

