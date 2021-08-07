const nodemails = require('nodemailer');

const sendEmail = async (options) => {
  //create a transporter
  const transporter = nodemails.createTransport({
    host: process.env.MAILGUN_HOST,
    port: process.env.MAILGUN_PORT,
    auth: {
      user: process.env.MAILGUN_USERNAME,
      pass: process.env.MAILGUN_PASSWORD,
    },
  });
  //define the email options
  const mailOptions = {
    from: 'VMT Bank <support@vmtbank.ng>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  //send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
