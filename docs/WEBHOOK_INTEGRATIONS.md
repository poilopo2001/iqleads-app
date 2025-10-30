# Webhook Integrations Guide

This guide provides examples for integrating CallIQ with various platforms to automatically receive and qualify leads.

## Table of Contents
- [Getting Your Webhook URL](#getting-your-webhook-url)
- [WordPress Contact Form 7](#wordpress-contact-form-7)
- [WooCommerce](#woocommerce)
- [Shopify](#shopify)
- [Zapier](#zapier)
- [Custom API Integration](#custom-api-integration)
- [Field Mapping](#field-mapping)

---

## Getting Your Webhook URL

1. Log in to your CallIQ dashboard
2. Navigate to **Lead Sources**
3. Click **Create New Source**
4. Copy your unique webhook URL: `https://your-domain.com/api/webhooks/leads/YOUR_TOKEN`

⚠️ **Keep your webhook token secret!** Anyone with this URL can send leads to your account.

---

## WordPress Contact Form 7

### Installation

1. Install the "Contact Form 7 to Webhook" plugin
2. Configure the webhook in your form settings

### Configuration

```php
// In your Contact Form 7 form settings, add this to the "Additional Settings" tab:

webhook_url: https://your-domain.com/api/webhooks/leads/YOUR_TOKEN
webhook_format: json
```

### Field Mapping

Configure your Contact Form 7 fields to match CallIQ format:

```
[text* first-name placeholder "First Name"]
[text* last-name placeholder "Last Name"]
[email* email placeholder "Email"]
[tel phone placeholder "Phone"]
[text company placeholder "Company"]
```

### Webhook Payload Example

```json
{
  "first-name": "John",
  "last-name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp"
}
```

---

## WooCommerce

### Using Zapier (Recommended)

1. Create a Zap with trigger: "WooCommerce - New Order"
2. Add action: "Webhooks by Zapier - POST"
3. Configure:
   - **URL**: `https://your-domain.com/api/webhooks/leads/YOUR_TOKEN`
   - **Payload Type**: JSON
   - **Data**: Map WooCommerce fields to CallIQ format

### Payload Example

```json
{
  "firstName": "{{customer_first_name}}",
  "lastName": "{{customer_last_name}}",
  "email": "{{customer_email}}",
  "phone": "{{customer_phone}}",
  "company": "{{billing_company}}"
}
```

### Custom Plugin (Advanced)

```php
<?php
// Add to your theme's functions.php or custom plugin

add_action('woocommerce_thankyou', 'send_lead_to_calliq', 10, 1);

function send_lead_to_calliq($order_id) {
    $order = wc_get_order($order_id);

    $data = array(
        'firstName' => $order->get_billing_first_name(),
        'lastName' => $order->get_billing_last_name(),
        'email' => $order->get_billing_email(),
        'phone' => $order->get_billing_phone(),
        'company' => $order->get_billing_company()
    );

    $webhook_url = 'https://your-domain.com/api/webhooks/leads/YOUR_TOKEN';

    wp_remote_post($webhook_url, array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($data),
        'timeout' => 15
    ));
}
?>
```

---

## Shopify

### Using Shopify Webhooks

1. Go to **Settings > Notifications** in your Shopify admin
2. Scroll to **Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Event**: Customer creation OR Order creation
   - **Format**: JSON
   - **URL**: `https://your-domain.com/api/webhooks/leads/YOUR_TOKEN`

### Payload Transformation

Shopify sends data in their format. Configure field mapping in CallIQ:

```json
{
  "fieldMapping": {
    "firstName": "customer.first_name",
    "lastName": "customer.last_name",
    "email": "customer.email",
    "phone": "customer.phone",
    "company": "billing_address.company"
  }
}
```

### Example Shopify Payload

```json
{
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "billing_address": {
    "company": "Acme Corp"
  }
}
```

---

## Zapier

### General Setup

1. Create a new Zap
2. Choose any trigger (form submission, CRM update, etc.)
3. Add action: **Webhooks by Zapier - POST**
4. Configure:

```
URL: https://your-domain.com/api/webhooks/leads/YOUR_TOKEN
Payload Type: json
Data:
  firstName: <map from trigger>
  lastName: <map from trigger>
  email: <map from trigger>
  phone: <map from trigger>
  company: <map from trigger>
```

### Common Zapier Triggers

- **Google Forms** - New response
- **Typeform** - New entry
- **HubSpot** - New contact
- **Mailchimp** - New subscriber
- **Calendly** - New event scheduled

---

## Custom API Integration

### Direct POST Request

```bash
curl -X POST https://your-domain.com/api/webhooks/leads/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp"
  }'
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function sendLead(leadData) {
  try {
    const response = await axios.post(
      'https://your-domain.com/api/webhooks/leads/YOUR_TOKEN',
      {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company
      }
    );

    console.log('Lead sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Python

```python
import requests

def send_lead(lead_data):
    webhook_url = 'https://your-domain.com/api/webhooks/leads/YOUR_TOKEN'

    payload = {
        'firstName': lead_data['first_name'],
        'lastName': lead_data['last_name'],
        'email': lead_data['email'],
        'phone': lead_data['phone'],
        'company': lead_data.get('company')
    }

    response = requests.post(webhook_url, json=payload)

    if response.status_code == 201:
        print('Lead sent successfully')
    else:
        print(f'Error: {response.json()}')
```

### PHP

```php
<?php
function sendLeadToCallIQ($leadData) {
    $webhookUrl = 'https://your-domain.com/api/webhooks/leads/YOUR_TOKEN';

    $payload = json_encode([
        'firstName' => $leadData['firstName'],
        'lastName' => $leadData['lastName'],
        'email' => $leadData['email'],
        'phone' => $leadData['phone'],
        'company' => $leadData['company'] ?? null
    ]);

    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}
?>
```

---

## Field Mapping

### Automatic Field Mapping

CallIQ automatically maps common field names:

| CallIQ Field | Accepted Variants |
|--------------|-------------------|
| `firstName` | `first_name`, `fname`, `name` (first word) |
| `lastName` | `last_name`, `lname`, `name` (second word) |
| `email` | `mail`, `email_address` |
| `phone` | `telephone`, `phone_number`, `mobile` |
| `company` | `company_name`, `organization` |

### Custom Field Mapping

Configure custom mapping in your Lead Source settings:

```json
{
  "fieldMapping": {
    "firstName": "contact.personal.firstName",
    "lastName": "contact.personal.lastName",
    "email": "contact.email_addresses[0].email",
    "phone": "contact.phone_numbers[0].number",
    "company": "account.name"
  }
}
```

This uses dot notation to navigate nested objects and supports array indexing.

---

## Testing Your Webhook

### Test GET Request

Verify your webhook is configured correctly:

```bash
curl https://your-domain.com/api/webhooks/leads/YOUR_TOKEN
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook is configured correctly",
  "source": {
    "id": "...",
    "name": "My WordPress Form",
    "type": "wordpress",
    "isActive": true,
    "totalLeadsReceived": 42,
    "lastLeadReceivedAt": "2025-01-30T10:00:00Z"
  }
}
```

### Test POST Request

Send a test lead:

```bash
curl -X POST https://your-domain.com/api/webhooks/leads/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1234567890"
  }'
```

Expected response:
```json
{
  "success": true,
  "leadId": "uuid-here",
  "message": "Lead received successfully"
}
```

---

## Validation Rules

### Required Fields

At least **one** of the following must be provided:
- `email` (valid email format)
- `phone` (10-15 digits)

### Optional Fields

- `firstName` (string)
- `lastName` (string)
- `company` (string)

### Error Responses

**Invalid token:**
```json
{
  "error": "Invalid webhook token"
}
```

**Missing required data:**
```json
{
  "error": "Invalid lead data",
  "details": ["Either email or phone is required"]
}
```

**Source disabled:**
```json
{
  "error": "Lead source is disabled"
}
```

---

## Best Practices

1. **Test First**: Always test with a sample payload before going live
2. **Monitor**: Check your Lead Sources dashboard for incoming leads
3. **Validate**: Ensure your forms collect email OR phone
4. **Secure**: Never expose your webhook token publicly
5. **Retry**: Implement retry logic for failed webhook calls
6. **Log**: Store webhook responses for debugging

---

## Support

Need help with integration? Contact support@calliq.com or check our [API documentation](./API.md).
