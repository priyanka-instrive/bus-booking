const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (mailId, link) => {
  const msg = {
    to: `${mailId}`,
    from: " noreply@gaiusone.com",
    subject: "This is password setup link",
    text: " set password link",
    html: `<strong>${link}</strong>`,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};

module.exports = sendMail;
