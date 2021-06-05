const sid = process.env.TWILIO_ACCOUNT_SID as string
const token = process.env.TWILIO_AUTH_TOKEN as string
const sender = process.env.TWILIO_PHONE_NO as string
const recipient = process.env.RECIPIENT_PHONE_NO as string
const client = require("twilio")(sid, token)

export function sendMessage(msg: string) {
	client.messages
		.create({
			body: msg,
			from: sender,
			to: recipient
		})
		.then((message: object) => console.log(message))
		.catch((e: string) => console.log(e))
}
