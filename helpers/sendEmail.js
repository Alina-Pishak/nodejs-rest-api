const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const msg = {
    ...data,
    from: "alinapishak@meta.ua",
  };
  await sgMail.send(msg);
  //   return true;
};

module.exports = sendEmail;
