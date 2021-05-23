const sid = process.env.TWILIO_ACCOUNT_SID
const token = process.env.TWILIO_AUTH_TOKEN
const sender = process.env.TWILIO_PHONE_NO
const recipient = process.env.RECIPIENT_PHONE_NO
const client = require("twilio")(sid, token)

export function sendMessage(msg: string) {
	client.messages
		.create({
			body: msg,
			from: sender,
			to: recipient
		})
		.then((message) => console.log(message))
		.catch((e) => console.log(e))
}
