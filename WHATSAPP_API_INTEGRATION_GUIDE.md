# WhatsApp Business API (Cloud API) Integration Guide

Complete guide to integrate WhatsApp Business API for automatic OTP delivery in DigBahi.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up WhatsApp Business Account](#step-1-set-up-whatsapp-business-account)
3. [Step 2: Create OTP Message Template](#step-2-create-otp-message-template)
4. [Step 3: Get API Credentials](#step-3-get-api-credentials)
5. [Step 4: Backend Implementation](#step-4-backend-implementation)
6. [Step 5: Frontend Implementation](#step-5-frontend-implementation)
7. [Step 6: Testing](#step-6-testing)
8. [Step 7: Production Deployment](#step-7-production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ FastAPI backend (already set up)
- ✅ Meta Business Manager account
- ✅ Phone number for WhatsApp Business
- ✅ Python 3.8+ with pip
- ✅ Environment variables management

---

## Step 1: Set Up WhatsApp Business Account

### 1.1 Create Meta Business Manager Account

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Click "Create Account" or sign in
3. Complete business verification:
   - Business name
   - Business type
   - Contact information
   - Business documents (if required)

### 1.2 Set Up WhatsApp Business Account (WABA)

1. In Meta Business Suite, go to **WhatsApp Manager**
2. Click **"Get Started"** or **"Add Phone Number"**
3. Choose **"Cloud API"** (recommended - easier setup)
4. Follow the setup wizard:
   - Verify your phone number
   - Complete business verification
   - Accept WhatsApp Business Policy

### 1.3 Get Your Phone Number ID

1. In WhatsApp Manager, go to **"API Setup"**
2. Note down:
   - **Phone Number ID** (e.g., `123456789012345`)
   - **WhatsApp Business Account ID** (WABA ID)

---

## Step 2: Create OTP Message Template

### 2.1 Create Template in WhatsApp Manager

1. Go to **WhatsApp Manager** → **Message Templates**
2. Click **"Create Template"**
3. Fill in:
   - **Name:** `digbahi_otp` (lowercase, no spaces)
   - **Category:** `OTP` (One-Time Password)
   - **Language:** `English (US)` or `English (India)`

### 2.2 Template Content

**Header:** (Optional - leave empty)

**Body:**
```
Your DigBahi OTP is {{1}}. This OTP is valid for 10 minutes. Please enter it in the application to verify.
```

**Footer:** (Optional - leave empty)

**Variables:**
- `{{1}}` = OTP code (6 digits)

### 2.3 Submit for Approval

1. Click **"Submit"**
2. Wait for approval (usually 5-10 minutes)
3. Status will change to **"Approved"** when ready

**Note:** Template must be approved before you can send messages!

---

## Step 3: Get API Credentials

### 3.1 Get Access Token

1. In WhatsApp Manager → **API Setup**
2. Click **"Generate Token"** or use **"System User Access Token"**
3. Copy the **Temporary Access Token** (valid for 24 hours)
4. For production, set up a **Permanent Access Token**:
   - Go to **Business Settings** → **System Users**
   - Create system user with WhatsApp permissions
   - Generate permanent token

### 3.2 Get App ID and App Secret (Optional - for permanent tokens)

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing
3. Add **WhatsApp** product
4. Get **App ID** and **App Secret**

### 3.3 Required Credentials

You'll need:
- ✅ **Phone Number ID** (from Step 1.3)
- ✅ **Access Token** (temporary or permanent)
- ✅ **Template Name** (e.g., `digbahi_otp`)
- ✅ **WhatsApp Business Account ID** (optional, for some operations)

---

## Step 4: Backend Implementation

### 4.1 Install Required Packages

Add to `backend/requirements.txt`:

```txt
requests>=2.31.0
python-dotenv>=1.0.0
```

Install:
```bash
cd backend
pip install requests python-dotenv
```

### 4.2 Create WhatsApp Service

Create `backend/app/services/whatsapp_service.py`:

```python
import os
import requests
from typing import Optional, Dict
from dotenv import load_dotenv

load_dotenv()

class WhatsAppService:
    """WhatsApp Business API (Cloud API) service for sending OTP messages"""
    
    def __init__(self):
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        self.access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        self.api_version = "v21.0"  # Latest API version
        self.base_url = f"https://graph.facebook.com/{self.api_version}"
        
        if not self.phone_number_id or not self.access_token:
            raise ValueError("WhatsApp credentials not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN")
    
    def send_otp(self, phone_number: str, otp_code: str, template_name: str = "digbahi_otp") -> Dict:
        """
        Send OTP via WhatsApp Business API
        
        Args:
            phone_number: Recipient phone number (with country code, e.g., "919876543210")
            otp_code: 6-digit OTP code
            template_name: WhatsApp template name (default: "digbahi_otp")
        
        Returns:
            Dict with success status and message ID or error details
        """
        # Format phone number (ensure it starts with country code)
        if not phone_number.startswith("91"):
            phone_number = f"91{phone_number}"  # Add India country code
        
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": "en_US"  # or "en_IN" for India
                },
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": otp_code
                            }
                        ]
                    }
                ]
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            return {
                "success": True,
                "message_id": result.get("messages", [{}])[0].get("id"),
                "status": "sent"
            }
        
        except requests.exceptions.HTTPError as e:
            error_data = e.response.json() if e.response else {}
            return {
                "success": False,
                "error": error_data.get("error", {}).get("message", str(e)),
                "error_code": error_data.get("error", {}).get("code"),
                "status": "failed"
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "status": "error"
            }
    
    def get_message_status(self, message_id: str) -> Dict:
        """Get delivery status of a sent message"""
        url = f"{self.base_url}/{self.phone_number_id}/messages/{message_id}"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
```

### 4.3 Create API Endpoint

Create `backend/app/api/v1/whatsapp.py`:

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from ...services.whatsapp_service import WhatsAppService
import secrets
import string

router = APIRouter(prefix="/api/v1/whatsapp")

# Initialize WhatsApp service
whatsapp_service = WhatsAppService()

# In-memory OTP storage (use database in production)
otp_storage = {}

class SendOTPRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number (10 digits, without country code)")
    template_name: Optional[str] = Field("digbahi_otp", description="WhatsApp template name")

class SendOTPResponse(BaseModel):
    success: bool
    message: str
    otp_code: Optional[str] = None
    message_id: Optional[str] = None
    expires_at: Optional[int] = None

class VerifyOTPRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number")
    otp_code: str = Field(..., description="6-digit OTP code")

class VerifyOTPResponse(BaseModel):
    success: bool
    message: str

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(request: SendOTPRequest):
    """
    Send OTP via WhatsApp Business API
    
    - Generates 6-digit OTP
    - Sends via WhatsApp
    - Stores OTP for verification (expires in 10 minutes)
    """
    try:
        # Validate phone number
        if len(request.phone_number) != 10 or not request.phone_number.isdigit():
            raise HTTPException(status_code=400, detail="Invalid phone number. Must be 10 digits.")
        
        # Generate OTP
        otp_code = generate_otp()
        
        # Send via WhatsApp
        result = whatsapp_service.send_otp(
            phone_number=request.phone_number,
            otp_code=otp_code,
            template_name=request.template_name
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send OTP: {result.get('error', 'Unknown error')}"
            )
        
        # Store OTP (expires in 10 minutes)
        import time
        expires_at = int(time.time()) + (10 * 60)  # 10 minutes
        
        otp_storage[request.phone_number] = {
            "otp": otp_code,
            "expires_at": expires_at,
            "message_id": result.get("message_id")
        }
        
        return SendOTPResponse(
            success=True,
            message="OTP sent successfully via WhatsApp",
            otp_code=otp_code,  # Only for testing - remove in production
            message_id=result.get("message_id"),
            expires_at=expires_at
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(request: VerifyOTPRequest):
    """
    Verify OTP code
    
    - Checks if OTP matches
    - Validates expiration
    - Clears OTP after successful verification
    """
    try:
        # Validate phone number
        if len(request.phone_number) != 10 or not request.phone_number.isdigit():
            raise HTTPException(status_code=400, detail="Invalid phone number")
        
        # Validate OTP format
        if len(request.otp_code) != 6 or not request.otp_code.isdigit():
            raise HTTPException(status_code=400, detail="Invalid OTP format. Must be 6 digits.")
        
        # Check if OTP exists
        stored_data = otp_storage.get(request.phone_number)
        if not stored_data:
            return VerifyOTPResponse(
                success=False,
                message="OTP not found. Please request a new OTP."
            )
        
        # Check expiration
        import time
        if time.time() > stored_data["expires_at"]:
            del otp_storage[request.phone_number]
            return VerifyOTPResponse(
                success=False,
                message="OTP has expired. Please request a new OTP."
            )
        
        # Verify OTP
        if stored_data["otp"] != request.otp_code:
            return VerifyOTPResponse(
                success=False,
                message="Invalid OTP. Please check and try again."
            )
        
        # Success - clear OTP
        del otp_storage[request.phone_number]
        
        return VerifyOTPResponse(
            success=True,
            message="OTP verified successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
```

### 4.4 Register Router in main.py

Update `backend/app/main.py`:

```python
# Add import
from .api.v1.whatsapp import router as whatsapp_router

# Add router (after other routers)
app.include_router(whatsapp_router)
```

### 4.5 Environment Variables

Create/update `.env` file in `backend/`:

```bash
# WhatsApp Business API Credentials
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here

# Optional: Template name (default: digbahi_otp)
WHATSAPP_OTP_TEMPLATE_NAME=digbahi_otp
```

**⚠️ IMPORTANT:** Never commit `.env` file to git!

---

## Step 5: Frontend Implementation

### 5.1 Update WhatsAppShare Component

Replace the `handleRequestOTP` function in `src/features/payments/WhatsAppShare.tsx`:

```typescript
async function handleRequestOTP() {
  if (!customerPhone || customerPhone.length !== 10) {
    toast.error('Please enter valid phone number first');
    return;
  }

  // Generate OTP (for local storage)
  const newOTP = generateOTP();
  setGeneratedOTP(newOTP);
  setShowOTP(true);
  setOtpVerified(false);
  setOtp('');
  setOtpSent(false);
  setShowOTPInUI(false);
  setOtpCopied(false);

  try {
    // Call backend API to send OTP via WhatsApp
    const response = await fetch('http://localhost:8000/api/v1/whatsapp/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: customerPhone,
        template_name: 'digbahi_otp'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to send OTP');
    }

    if (data.success) {
      // Update generated OTP with server-generated one (for verification)
      setGeneratedOTP(data.otp_code);
      setOtpSent(true);
      
      // Store OTP in sessionStorage for verification
      sessionStorage.setItem(`otp_${customerPhone}`, JSON.stringify({
        otp: data.otp_code,
        expiresAt: data.expires_at * 1000 // Convert to milliseconds
      }));

      toast.success('OTP sent successfully via WhatsApp! Please check your messages.');
    } else {
      throw new Error(data.message || 'Failed to send OTP');
    }

  } catch (error) {
    console.error('Failed to send OTP:', error);
    toast.error(`Failed to send OTP: ${error.message}`);
    
    // Fallback: Show OTP in UI
    setShowOTPInUI(true);
    setOtpSent(true);
    
    // Store OTP locally as fallback
    sessionStorage.setItem(`otp_${customerPhone}`, JSON.stringify({
      otp: newOTP,
      expiresAt: Date.now() + 10 * 60 * 1000
    }));
  }
}
```

### 5.2 Update OTP Verification (Optional - use backend)

You can also verify OTP on the backend:

```typescript
async function handleVerifyOTP() {
  if (otp.length !== 6) {
    toast.error('Please enter 6-digit OTP');
    return;
  }

  try {
    // Verify with backend
    const response = await fetch('http://localhost:8000/api/v1/whatsapp/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: customerPhone,
        otp_code: otp
      }),
    });

    const data = await response.json();

    if (data.success) {
      setOtpVerified(true);
      toast.success('OTP verified successfully');
      sessionStorage.removeItem(`otp_${customerPhone}`);
    } else {
      toast.error(data.message || 'Invalid OTP');
    }
  } catch (error) {
    // Fallback to local verification
    const storedOTPData = sessionStorage.getItem(`otp_${customerPhone}`);
    // ... existing verification logic
  }
}
```

### 5.3 Environment Configuration

Create `.env` file in frontend root (if using Vite):

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Update API calls to use environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

---

## Step 6: Testing

### 6.1 Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6.2 Test API Endpoint

```bash
curl -X POST http://localhost:8000/api/v1/whatsapp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210"}'
```

### 6.3 Test in Frontend

1. Open http://localhost:5173
2. Fill in customer phone number
3. Select "Credit Sale"
4. Click "Send OTP via WhatsApp"
5. Check WhatsApp for OTP message
6. Enter OTP and verify

---

## Step 7: Production Deployment

### 7.1 Security Checklist

- [ ] Use permanent access token (not temporary)
- [ ] Store credentials in secure environment variables
- [ ] Use HTTPS for API calls
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Use database for OTP storage (not in-memory)
- [ ] Remove OTP from API response in production

### 7.2 Update Backend for Production

1. **Use Database for OTP Storage:**
   - Store OTPs in database with expiration
   - Clean up expired OTPs periodically

2. **Add Rate Limiting:**
   - Limit OTP requests per phone number
   - Prevent abuse

3. **Remove OTP from Response:**
   - Don't return `otp_code` in API response
   - Only return success/failure

4. **Add Monitoring:**
   - Log all OTP send attempts
   - Track success/failure rates
   - Monitor API quota usage

---

## Troubleshooting

### Issue: "Template not found"
**Solution:** Ensure template is approved in WhatsApp Manager

### Issue: "Invalid phone number"
**Solution:** Format: 10 digits without country code (backend adds it)

### Issue: "Access token expired"
**Solution:** Generate new token or use permanent token

### Issue: "Rate limit exceeded"
**Solution:** WhatsApp has rate limits. Wait or upgrade plan

### Issue: "Message not delivered"
**Solution:** 
- Check phone number format
- Ensure recipient has WhatsApp
- Check message status in WhatsApp Manager

---

## Cost Considerations

- **WhatsApp Business API:** Free tier available (1000 conversations/month)
- **Pricing:** Pay per conversation after free tier
- **Template Messages:** Free (OTP category)
- **Session Messages:** Paid (after 24-hour window)

---

## Next Steps

1. ✅ Complete Step 1-3 (Account setup)
2. ✅ Implement backend (Step 4)
3. ✅ Update frontend (Step 5)
4. ✅ Test thoroughly (Step 6)
5. ✅ Deploy to production (Step 7)

---

**Need Help?** Check [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)

