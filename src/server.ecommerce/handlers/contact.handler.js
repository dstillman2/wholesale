import sendgrid from 'sendgrid';

import { SENDGRID_API_KEY, GOOGLE_API_KEY } from '../options';

const contactHandler = {
  get(req, res) {
    const a = req.account;

    res.render('default/contact', {
      pageTitle: 'Contact Us',
      account: req.account,
      categories: req.categories,
      isLoggedIn: req.isAuthenticated,
      isContactPage: true,
      logoFilePath: req.logoFilePath,
      googleApiKey: GOOGLE_API_KEY,
      googleMapsSearchQuery: encodeURIComponent(`
        ${a.address_1} ${a.address_2}, ${a.city} ${a.state}, ${a.zip_code}
      `),
      isDemo: process.env.NODE_ENV !== 'production',
    });
  },

  post(req, res) {
    const params = {
      first_name: req.body.first_name,
      email: req.body.email_address,
      message: req.body.message,
    };

    const sg = sendgrid(SENDGRID_API_KEY);

    const request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: {
        personalizations: [
          {
            to: [
              {
                email: req.marketplaceSettings.contact_form_email,
              },
            ],
            subject: `Contact Form - Message from ${params.first_name}`,
          },
        ],
        from: {
          email: 'noreply@ordernimbus.com',
        },
        content: [
          {
            type: 'text/html',
            value: `
              <p><b>Message from ${params.email}</b></p>
              <p>${params.message}</p>
            `,
          },
        ],
      },
    });

    sg.API(request, (error) => {
      if (error) {
        res.status(500).json({ error });
      } else {
        res.end();
      }
    });
  },
};

export default contactHandler;
