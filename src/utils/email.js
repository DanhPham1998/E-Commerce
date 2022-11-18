const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDFRID_PASSWORD);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0] || 'Your';
    this.from = `E-Commerce <${process.env.EMAIL_FROM}>`;
    this.url = url;
  }

  async sendMail(subject, textsend) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: subject,
      text: textsend,
      html: textsend,
    };

    await sgMail.send(mailOptions);
  }

  async sendWelcome() {
    const textsend = `<h2>Welcome to E-Commerce<a href="${this.url}">${this.url}</a><br></h2>`;
    await this.sendMail('WelCome', textsend);
  }

  async sendResetPassword() {
    const textsend = `<b>You have just sent a request to reset your password:<a href="${this.url}">${this.url}</a><br>
      If you did not ask, please ignore this message</b>`;
    await this.sendMail('Reset Password', textsend);
  }

  async sendVerifyEmail() {
    const textsend = `<h3>Click the link to confirm the email:<a href="${this.url}">${this.url}</a><br></h3>`;
    await this.sendMail('Verify Email', textsend);
  }
};
