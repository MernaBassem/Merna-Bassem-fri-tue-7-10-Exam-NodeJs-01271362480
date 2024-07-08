
import nodemailer from "nodemailer";
/**
 * @param {object} params - object of email params
 * @returns {Promise} - Promise object represents the info of the sent email
 * @description - Send email service
 */

export const sendEmailService = async ({
  to,
  subject = "No Reply",
  textMessage = "",
  htmlMessage = "",
  attachments = [],
} = {}) => {
  // configer email ( transporter)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: "mernabassem21@gmail.com", 
      pass: "yajvbppxnvvpitbe", 
    },
  });
  // configer message ( mail )
  const info = await transporter.sendMail({
    from: "No Retry <mernabassem21@gmail.com>",
    to,
    subject,
    text: textMessage,
    html: htmlMessage,
    attachments,
  });

  return info;
};
