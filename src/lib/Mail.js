import nodemailer from 'nodemailer';
import exphbs from 'express-handlebars';
import nodemialerhbs from 'nodemailer-express-handlebars';
import { resolve } from 'path';
import configMail from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = configMail;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });

    this.confirureTemplates();
  }

  confirureTemplates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    this.transporter.use(
      'compile',
      nodemialerhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...configMail.default,
      ...message,
    });
  }
}

export default new Mail();
