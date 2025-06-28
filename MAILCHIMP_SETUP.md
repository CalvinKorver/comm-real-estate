# Mailchimp Setup Guide

This guide will help you set up Mailchimp integration for the email subscription functionality.

## Prerequisites

1. A Mailchimp account (free tier available)
2. An audience/list created in Mailchimp

## Step 1: Get Your Mailchimp API Key

1. Log in to your Mailchimp account
2. Go to **Account** → **Extras** → **API keys**
3. Click **Create A Key**
4. Copy the generated API key (it will look like: `abc123def456ghi789-us1`)

## Step 2: Find Your Server Prefix

Your server prefix is the part after the hyphen in your API key. For example:
- If your API key is `abc123def456ghi789-us1`, your server prefix is `us1`
- If your API key is `xyz789abc456def123-us2`, your server prefix is `us2`

## Step 3: Get Your Audience/List ID

1. In Mailchimp, go to **Audience** → **All contacts**
2. Click **Settings** → **Audience name and defaults**
3. Scroll down to find your **Audience ID** (it will look like: `1234567890`)

## Step 4: Set Up Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```bash
# Mailchimp Configuration
MAILCHIMP_API_KEY=your_api_key_here
MAILCHIMP_SERVER_PREFIX=your_server_prefix_here
MAILCHIMP_LIST_ID=your_audience_id_here
```

Replace the placeholder values with your actual Mailchimp credentials.

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/marketing`
3. Enter an email address and click "Submit"
4. Check your Mailchimp audience to see if the contact was added

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your API key is correct
   - Ensure there are no extra spaces or characters

2. **"Server prefix not found" error**
   - Verify your server prefix matches the one in your API key
   - The server prefix is case-sensitive

3. **"List ID not found" error**
   - Make sure you're using the correct Audience ID
   - Ensure the audience exists and is active

4. **"Email already subscribed" error**
   - This is expected behavior if the email is already in your audience
   - The API will return a success message for new subscriptions

### API Response Codes

- `201`: Success - Email subscribed successfully
- `400`: Bad Request - Email already subscribed or invalid email
- `500`: Server Error - Check your environment variables and Mailchimp configuration

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Use different API keys for development and production environments

## Production Deployment

When deploying to production (e.g., Vercel):

1. Add the same environment variables in your hosting platform's dashboard
2. Use a production Mailchimp account if needed
3. Consider using a separate audience/list for production testing

## Mailchimp Features Used

The integration uses the following Mailchimp API endpoints:
- `lists.addListMember`: Adds a new contact to your audience
- Automatic merge field tagging with source information
- Duplicate email handling with appropriate error messages 