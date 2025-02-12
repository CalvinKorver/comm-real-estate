// server.js
import mailchimp from '@mailchimp/mailchimp_marketing';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_KEY.split('-')[1],
});

// Subscribe endpoint
app.post('/api/subscribe', async (req, res) => {
  if (process.env.API_TEST === 'true') {
    console.log('API_TEST is true, skipping Mailchimp API call');
    return res.status(200).json({ message: 'Success! 🎉' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    console.error('Invalid email:', email);
    return res
      .status(400)
      .json({ error: 'Email is required and must be valid' });
  }

  try {
    console.log('Subscribing email to Mailchimp:', email);
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_LIST_ID,
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          S_SOURCE: 'Marketing Website',
        },
      },
    );
    console.log('Mailchimp API response:', response);
    return res.status(201).json({
      message: 'Success! 🎉',
      memberId: response.id,
    });
  } catch (error) {
    console.error('Mailchimp API Error:', error);
    if (error.response) {
      const { status, detail } = error.response;

      if (status === 400 && error.response.body) {
        console.log(error.response.body.title + ' ' + error.response.body.detail);
        return res.status(400).json({
          error: 'This email is already subscribed to our newsletter.',
        });
      }
      console.log(error.response.body.title);
      return res.status(400).json({
        error: detail || 'There was an error subscribing to the newsletter.',
      });
    }

    console.error('Mailchimp API Error:', error);
    return res.status(500).json({
      error: 'There was an error subscribing to the newsletter.',
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
