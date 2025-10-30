# 🚀 IQLead Connector - WordPress Plugin

**Automatically send WordPress form submissions to IQLead for AI-powered lead qualification and calling**

[![WordPress](https://img.shields.io/badge/WordPress-5.0+-blue.svg)](https://wordpress.org/)
[![PHP](https://img.shields.io/badge/PHP-7.4+-purple.svg)](https://php.net/)
[![License](https://img.shields.io/badge/License-GPL%20v2-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

## 📋 Description

IQLead Connector seamlessly integrates your WordPress forms with IQLead's AI-powered lead management platform. Every form submission is automatically sent to IQLead for:

- ✅ **Automatic lead qualification**
- 📞 **AI-powered outbound calling**
- 🎯 **Smart lead scoring**
- 📊 **Real-time analytics**

## ✨ Supported Form Plugins

The plugin automatically detects and integrates with:

- ✅ **Contact Form 7** (most popular)
- ✅ **WPForms** (drag & drop builder)
- ✅ **Gravity Forms** (premium forms)
- ✅ **Ninja Forms** (flexible builder)
- ✅ **Elementor Forms** (page builder forms)

## 🔧 Installation

### Method 1: Upload via WordPress Admin (Recommended)

1. Download the plugin ZIP file
2. Go to **WordPress Admin → Plugins → Add New**
3. Click **Upload Plugin**
4. Choose the ZIP file and click **Install Now**
5. Click **Activate Plugin**

### Method 2: Manual Installation

1. Download and extract the plugin files
2. Upload the `iqleads-connector` folder to `/wp-content/plugins/`
3. Go to **Plugins** in WordPress admin
4. Find **IQLead Connector** and click **Activate**

### Method 3: FTP Upload

```bash
# Upload via FTP to:
/wp-content/plugins/iqleads-connector/

# Then activate via WordPress admin
```

## ⚙️ Configuration

### Step 1: Get Your Webhook URL

1. Log in to your **IQLead Dashboard**
2. Navigate to **Sources**
3. Click **"Create New Source"**
4. Select **"WordPress"** as integration type
5. Copy the generated **Webhook URL**
   - Example: `https://your-domain.com/api/webhooks/leads/abc123xyz789...`

### Step 2: Configure the Plugin

1. Go to **Settings → IQLead Connector** in WordPress
2. Check **"Enable IQLead Connector"**
3. Paste your **Webhook URL**
4. (Optional) Enable **Debug Mode** for troubleshooting
5. Click **Save Settings**

### Step 3: Test the Connection

1. Scroll to **"Test Connection"** section
2. Fill in test data:
   - Email: `test@example.com`
   - Name: `Test User`
   - Phone: `+1234567890`
3. Click **"Send Test Lead"**
4. Check IQLead dashboard for the test lead

## 📝 How It Works

### Automatic Field Mapping

The plugin intelligently maps form fields to IQLead's standard format:

```php
WordPress Form Field  →  IQLead Field
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
your-email, email     →  email
your-name, name       →  firstName
your-surname, lname   →  lastName
your-phone, phone     →  phone
your-company          →  company
your-message          →  message
```

### Smart Detection

IQLead's backend has **3-layer intelligent mapping**:

1. **Auto-Detection** (90% of cases)
   - Recognizes 50+ common field name variations
   - Works with any language (English, French, Spanish, etc.)

2. **AI-Powered Mapping** (fallback)
   - Uses Google Gemini 2.0 Flash
   - Handles complex/nested field structures

3. **Manual Override** (advanced)
   - Custom JSON field mapping
   - For non-standard field names

## 🎯 Usage Examples

### Example 1: Contact Form 7

```html
[text* your-name placeholder "Full Name"]
[email* your-email placeholder "Email"]
[tel your-phone placeholder "Phone"]
[text your-company placeholder "Company"]
[textarea your-message placeholder "Message"]
[submit "Send"]
```

**Result:** Automatically captured and sent to IQLead ✅

### Example 2: WPForms

Create a form with:
- Name field (type: Name)
- Email field (type: Email)
- Phone field (type: Phone)
- Company field (type: Single Line Text)

**Result:** Automatically captured and sent to IQLead ✅

### Example 3: Gravity Forms

Add fields:
- Name (First & Last)
- Email
- Phone
- Single Line Text (label: "Company Name")

**Result:** Automatically captured and sent to IQLead ✅

## 🐛 Troubleshooting

### Leads not appearing in IQLead?

**Check 1: Plugin Status**
```
Settings → IQLead Connector
→ Verify "Enable IQLead Connector" is checked
```

**Check 2: Webhook URL**
```
Settings → IQLead Connector
→ Verify Webhook URL is correct (starts with https://)
```

**Check 3: Form Plugin Active**
```
Plugins → Installed Plugins
→ Verify your form plugin (CF7, WPForms, etc.) is active
```

**Check 4: Debug Logs**
```
1. Enable "Debug Mode" in plugin settings
2. Submit a test form
3. Check WordPress debug.log:
   - Look for "IQLead: Sending data"
   - Look for "IQLead: Success" or "IQLead: Error"
```

**Check 5: Test Connection**
```
Settings → IQLead Connector → Test Connection
→ Send a test lead
→ Check IQLead dashboard
```

### Common Issues

**Issue: "Webhook URL not configured"**
- Solution: Add your webhook URL in plugin settings

**Issue: "IQLead connector is disabled"**
- Solution: Check the "Enable" checkbox and save

**Issue: "No supported form plugins detected"**
- Solution: Install and activate Contact Form 7, WPForms, or another supported plugin

**Issue: HTTP error codes**
- `401 Unauthorized`: Invalid webhook token
- `403 Forbidden`: Lead source is disabled in IQLead
- `500 Server Error`: Contact IQLead support

## 🔒 Security

- ✅ All data sanitized before sending
- ✅ Uses WordPress nonce verification
- ✅ Webhook URL validated
- ✅ HTTPS only for production
- ✅ No data stored in WordPress (sent directly to IQLead)

## 📊 Debug Mode

Enable debug mode to log all submissions:

```php
// WordPress debug.log will show:
IQLead: Sending data - {"email":"user@example.com","firstName":"John",...}
IQLead: Success - Status 201
```

Location of debug.log:
```
/wp-content/debug.log
```

## 🆘 Support

Need help? Contact us:

- 📧 Email: support@iqleads.com
- 🌐 Website: https://iqleads.com
- 📖 Documentation: https://docs.iqleads.com
- 💬 Live Chat: Available in IQLead dashboard

## 📜 Changelog

### Version 1.0.0 (2025-01-30)
- ✨ Initial release
- ✅ Support for Contact Form 7
- ✅ Support for WPForms
- ✅ Support for Gravity Forms
- ✅ Support for Ninja Forms
- ✅ Support for Elementor Forms
- ✅ Automatic field mapping
- ✅ Test webhook functionality
- ✅ Debug mode

## 🎉 Credits

Developed by **IQLead Team**
- Website: https://iqleads.com
- License: GPL v2 or later

## 📄 License

This plugin is licensed under the GPL v2 or later.

```
Copyright (C) 2025 IQLead

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
```

---

**Made with ❤️ by IQLead** | Transform your WordPress leads into qualified opportunities
