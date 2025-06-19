const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use your SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `https://your-domain.com/api/users/verify/${token}`;

  await transporter.sendMail({
    from: `"Your Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    html: `<h3>Verify your account</h3><p>Click the link below:</p><a href="${verifyUrl}">Verify Email</a>`
  });
};

module.exports = sendVerificationEmail;
