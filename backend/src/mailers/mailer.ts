import { Env } from "../config/env.config";
import { resend } from "../config/resend.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender = `FinoraAI <${Env.RESEND_MAILER_SENDER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) => {
  const data = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });

  if (data.error) {
    console.error("❌ Resend Error:", JSON.stringify(data.error, null, 2));
    throw new Error(`Resend Error: ${data.error.message}`);
  } else {
    console.log("✅ Resend Success:", JSON.stringify(data.data, null, 2));
  }

  return data;
};
