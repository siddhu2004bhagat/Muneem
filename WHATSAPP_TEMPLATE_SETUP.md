# WhatsApp Template Setup - REQUIRED

## ⚠️ Current Issue

The WhatsApp template `digbahi_otp` **does not exist** in your WhatsApp Business Account. This is why OTPs are not being sent automatically.

**Error Code**: 132001 - "Template name does not exist in the translation"

## ✅ Solution: Create the Template

### Step 1: Go to WhatsApp Manager
1. Open: https://business.facebook.com/wa/manage/message-templates/
2. Make sure you're logged into the Meta Business account that has your WhatsApp Business API

### Step 2: Create New Template
1. Click **"Create Template"** button
2. Select **"Start from scratch"**

### Step 3: Template Details
- **Name**: `digbahi_otp` (must be exactly this)
- **Category**: Select **"OTP"**
- **Language**: Select **"English (US)"** or **"English (India)"**

### Step 4: Template Content
**Body Text:**
```
Your DigBahi OTP is {{1}}. This OTP is valid for 10 minutes.
```

**Important:**
- Add parameter `{{1}}` where the OTP code will appear
- This is a single parameter for the 6-digit OTP

### Step 5: Submit for Approval
1. Click **"Submit"**
2. Wait for approval (usually 5-10 minutes, can take up to 24 hours)

### Step 6: Verify Template
Once approved, you can verify it exists by:
- Going back to the templates page
- Searching for `digbahi_otp`
- It should show status: **"Approved"**

## 🔄 After Template is Created

Once the template is approved:
1. The application will automatically use it
2. OTPs will be sent directly to WhatsApp (no manual copy/paste needed)
3. Users will receive OTPs instantly

## 📝 Alternative: Use Different Template Name

If you want to use a different template name:
1. Create the template with your preferred name
2. Update the code in `WhatsAppShare.tsx`:
   ```typescript
   const result = await whatsappAPIService.sendOTP(customerPhone, 'your_template_name');
   ```

## 🐛 Troubleshooting

### Template Not Showing Up
- Make sure you're in the correct WhatsApp Business Account
- Check that your Phone Number ID matches the account
- Verify the template is approved (not pending)

### Still Getting Errors
- Check the template name matches exactly (case-sensitive)
- Verify the language code matches (en_US or en_IN)
- Make sure the template has the parameter `{{1}}` in the body

## 📞 Support

If you continue to have issues:
1. Check backend logs: `tail -f /tmp/backend.log`
2. Verify credentials in `backend/.env`
3. Test API directly: `curl -X POST http://localhost:8000/api/v1/whatsapp/send-otp ...`

