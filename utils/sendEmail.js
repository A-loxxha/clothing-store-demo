const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use your SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.SERVER_URL}/api/users/verify/${token}`;


  await transporter.sendMail({
    from: `"Your Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
   html: `
  <h3>Verify your account</h3>
  <p>Thanks for signing up with Mabel Statement. Click the button below to verify your email address:</p>
  <p><a href="${verifyUrl}" style="background:#ceb974; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Verify Email</a></p>
  <p>If the button doesn't work, copy and paste this link into your browser:</p>
  <p>${verifyUrl}</p>
`

  });
};

module.exports = sendVerificationEmail;
