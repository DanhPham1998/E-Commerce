const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDFRID_PASSWORD);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0] || 'Your';
    this.from = `E-Commerce <${process.env.EMAIL_FROM}>`;
    this.url = url;
  }

  async sendMail(subject, text) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: subject,
      text: text,
      html: `<b>You have just sent a request to reset your password:<a href="${this.url}">${this.url}</a><br>
      If you did not ask, please ignore this message</b>`,
    };

    await sgMail.send(mailOptions);
  }

  async sendWelcome() {
    await this.sendMail('WelCome', 'Welcome to Camper ');
  }

  async sendResetPassword() {
    await this.sendMail('Reset Password', 'Reset password Accout Camper');
  }
};
