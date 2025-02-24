import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY!,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      console.error('Invalid email:', email);
      return NextResponse.json(
        { error: 'Email is required and must be valid' },
        { status: 400 }
      );
    }

    console.log('Subscribing email to Mailchimp:', email);
    console.log(process.env.MAILCHIMP_LIST_ID)
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_LIST_ID!,
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          S_SOURCE: 'Marketing Website',
        },
      }
    );

    console.log('Mailchimp API response:', response);
    return NextResponse.json({
      message: 'Success! 🎉'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Mailchimp API Error:', error);
    
    if (error.response) {
      const { status, detail } = error.response;

      if (status === 400 && error.response.body) {
        console.log(error.response.body.title + ' ' + error.response.body.detail);
        return NextResponse.json({
          error: 'This email is already subscribed to our newsletter.',
        }, { status: 400 });
      }

      console.log(error.response.body.title);
      return NextResponse.json({
        error: detail || 'There was an error subscribing to the newsletter.',
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'There was an error subscribing to the newsletter.',
    }, { status: 500 });
  }
}