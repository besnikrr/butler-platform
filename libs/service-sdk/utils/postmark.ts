import * as postmark from "postmark";

export interface ISendEmail {
  from: string,
  to: string[],
  subject: string,
  attachments: postmark.Attachment[],
  htmlBody?: string,
  textBody: string
}

export const sendEmail = async (data: ISendEmail) => {
  const client = new postmark.Client(process.env.POSTMARK_SERVER_TOKEN);
  return await client.sendEmail({
    "From": data.from,
    "To": data.to.join(","),
    "Subject": data.subject,
    "Attachments": data.attachments,
    ...(data.htmlBody ? { "HtmlBody": data.htmlBody } : { "Textbody": data.textBody })
  });
};
