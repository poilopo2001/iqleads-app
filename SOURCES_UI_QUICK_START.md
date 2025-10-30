# Lead Sources UI - Quick Start Guide

## Access the Sources Management Page

Navigate to: **http://localhost:3000/dashboard/sources** (or your deployed URL)

Or click **"Sources"** in the dashboard navigation menu.

## Component Structure

```
app/dashboard/sources/
├── page.tsx                          # Main sources page
└── components/
    ├── SourcesTable.tsx              # Table displaying all sources
    ├── SourceFilters.tsx             # Search and filter controls
    ├── CreateSourceButton.tsx        # Opens create modal
    ├── CreateSourceModal.tsx         # Create new source form
    ├── EditSourceButton.tsx          # Opens edit modal
    ├── EditSourceModal.tsx           # Edit existing source form
    ├── TestWebhookButton.tsx         # Opens test modal
    ├── TestWebhookModal.tsx          # Webhook testing interface
    ├── CopyWebhookButton.tsx         # Copy webhook URL utility
    ├── ToggleActiveButton.tsx        # Toggle source status
    └── DeleteSourceButton.tsx        # Delete with confirmation
```

## Quick Actions

### Create a New Source
1. Click **"Create New Source"** button
2. Fill in the form:
   - **Name**: e.g., "Website Contact Form"
   - **Type**: Select from dropdown (WordPress, WooCommerce, Shopify, etc.)
   - **Description**: Optional description
   - **Checkboxes**:
     - ✓ Active (receive webhooks immediately)
     - ✓ Auto-qualify (automatically run qualification rules)
     - ☐ Auto-call (automatically call qualified leads)
   - **Field Mapping**: Optional JSON for custom field mapping
3. Click **"Create Source"**
4. **Success screen shows**:
   - Your webhook URL
   - Copy button for quick integration
   - Integration instructions

### Edit an Existing Source
1. Find the source in the table
2. Click the **Edit** icon (pencil)
3. Modify any fields
4. Click **"Save Changes"**

### Test Webhook Integration
1. Click the **Test** icon (flask) for any source
2. Modal shows:
   - **GET URL**: For connectivity testing
   - **POST URL**: Your webhook endpoint
   - **Test Payload**: Pre-filled JSON you can modify
3. Click **"Send Test"**
4. View the response (success/error)

### Toggle Active Status
- Click the status badge (Active/Inactive) to toggle
- Changes take effect immediately
- Inactive sources won't receive webhooks

### Delete a Source
1. Click the **Delete** icon (trash)
2. Confirm deletion in the dialog
3. Source is permanently removed

### Copy Webhook URL
- Click **"Copy"** button next to any webhook URL
- Visual feedback shows "Copied!"
- URL is in your clipboard

## Filtering and Search

### Search
- Type in the search box to filter by name or description
- Results update as you type

### Filter by Type
- Use the **"All Types"** dropdown
- Select: WordPress, WooCommerce, Shopify, Zapier, Custom, or API

### Filter by Status
- Use the **"All Status"** dropdown
- Select: Active or Inactive

## Understanding the Table

### Columns
| Column | Description |
|--------|-------------|
| **Name** | Source name and description |
| **Type** | Source type (colored badge) |
| **Status** | Active/Inactive (clickable to toggle) |
| **Webhook URL** | Full endpoint URL with copy button |
| **Total Leads** | Number of leads received from this source |
| **Last Received** | Timestamp of last lead received |
| **Actions** | Test, Edit, Delete buttons |

## Field Mapping Example

When creating or editing a source, you can provide a JSON field mapping to transform incoming webhook data:

```json
{
  "email": "customer_email",
  "phone": "billing_phone",
  "firstName": "first_name",
  "lastName": "last_name",
  "company": "company_name"
}
```

This maps:
- Incoming field `customer_email` → Lead field `email`
- Incoming field `billing_phone` → Lead field `phone`
- etc.

## Webhook Integration

### Your Webhook URL Format
```
https://your-domain.com/api/webhooks/leads/{unique-token}
```

### Send Data via POST
```bash
curl -X POST https://your-domain.com/api/webhooks/leads/{token} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Inc"
  }'
```

### Test Connectivity via GET
```bash
curl https://your-domain.com/api/webhooks/leads/{token}?config=true
```

## Common Use Cases

### WordPress Form Integration
1. Create source with type: **WordPress**
2. Copy webhook URL
3. Use WPForms/Contact Form 7/Gravity Forms webhook addon
4. Paste webhook URL in form settings
5. Test with webhook testing modal

### WooCommerce Orders
1. Create source with type: **WooCommerce**
2. Copy webhook URL
3. In WooCommerce → Settings → Advanced → Webhooks
4. Create new webhook for "Order created"
5. Paste webhook URL
6. Test with sample order

### Zapier Integration
1. Create source with type: **Zapier**
2. Copy webhook URL
3. In Zapier, create new Zap
4. Add "Webhooks by Zapier" action
5. Select "POST"
6. Paste webhook URL
7. Map fields and test

### Shopify Integration
1. Create source with type: **Shopify**
2. Copy webhook URL
3. In Shopify Admin → Settings → Notifications
4. Create webhook for "Customer created"
5. Paste webhook URL
6. Test with webhook tester

## Troubleshooting

### Webhook Not Receiving Data
1. Check source status is **Active**
2. Use the **Test Webhook** feature
3. Verify GET endpoint returns success
4. Check webhook URL is correct
5. Verify source type matches integration
6. Review field mapping if using custom fields

### Test Webhook Fails
- Check network connectivity
- Verify webhook URL is accessible
- Check JSON payload is valid
- Review error message in response

### Leads Not Appearing
- Verify source is **Active**
- Check **Total Leads** counter
- Review field mapping configuration
- Check API logs for errors

## Pro Tips

1. **Name your sources descriptively**: "WP Contact Form - Homepage" instead of just "WordPress"
2. **Use descriptions**: Note which page/form the source is connected to
3. **Test before going live**: Use the test feature before connecting real integrations
4. **Monitor your sources**: Check the "Total Leads" and "Last Received" regularly
5. **Field mapping for custom fields**: Use field mapping when webhook fields don't match your lead schema
6. **Keep sources organized**: Deactivate sources you're not using instead of deleting

## API Response Examples

### Successful Webhook Receipt
```json
{
  "success": true,
  "message": "Lead received successfully",
  "leadId": "uuid-here"
}
```

### Error Response
```json
{
  "error": "Invalid payload format",
  "details": "Missing required field: email"
}
```

## Next Steps

After setting up your sources:
1. View incoming leads at `/dashboard/leads`
2. Set up qualification rules (if auto-qualify is enabled)
3. Configure auto-calling (if enabled)
4. Monitor webhook performance
5. Review integration documentation at `/docs/WEBHOOK_INTEGRATIONS.md`

## Getting Help

- View full implementation details: `LEAD_SOURCES_UI_IMPLEMENTATION.md`
- Webhook integration guide: `/docs/WEBHOOK_INTEGRATIONS.md`
- API documentation: Check `/api/lead-sources` endpoint docs
