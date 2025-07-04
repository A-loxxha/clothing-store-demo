const mailgun = require('mailgun-js');
require('dotenv').config();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

/**
 * Send a general email
 */
const sendEmail = async (to, subject, html) => {
  const data = {
    from: process.env.MAIL_FROM, // e.g. 'Mabel Statement <no-reply@yourdomain.com>'
    to,
    subject,
    html,
    text: html.replace(/<[^>]*>/g, '') // Fallback plain text
  };

  return new Promise((resolve, reject) => {
    mg.messages().send(data, (error, body) => {
      if (error) {
        console.error('📧 Mailgun ERROR:', error);
        return reject(error);
      }
      console.log('📧 Mail sent via Mailgun:', body);
      resolve(body);
    });
  });
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.SERVER_URL}/api/users/verify/${token}`;

  const html = `
    <h3>Verify your account</h3>
    <p>Thanks for signing up to Mabel Statement. Click the button below to verify your email address:</p>
    <p><a href="${verifyUrl}" style="background:#ceb974; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Verify Email</a></p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>${verifyUrl}</p>
  `;

  return sendEmail(to, 'Verify your email', html);
};

module.exports = { sendEmail, sendVerificationEmail };
