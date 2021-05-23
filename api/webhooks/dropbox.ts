import fetch from "node-fetch"

import crypto from "crypto"
const DEV = process.env.NODE_ENV === "development"
if (DEV) {
	require("dotenv").config()
}

const { N8N_HOOK_URL, DBX_APP_SECRET, N8N_HOOK_SECRET } = process.env
import { VercelRequest, VercelResponse } from "@vercel/node"
import { sendMessage } from "../../lib/sms"

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	console.log("Handling req...")
	if (req.method == "GET" && req.query.challenge) {
		console.log("Handling challenge...")
		res.send(req.query.challenge)
		console.log("Handled challenge.")
		return
	}

	const rawBody = await getRawBody(req)

	const valid = verifyReq(rawBody, req)

	if (valid && req.method == "POST") {
		res.send("Handled req.")
		sendMessage("A file was updated in Dropbox. n8n workflow should be executing.")
		console.log("Handling valid req, sending body to n8n server...")
		await fetch(N8N_HOOK_URL, {
			body: req.body,
			method: "POST",
			headers: { N8N_HOOK_SECRET }
		})
		console.log("Sent body to n8n server.")
		return
	}

	res.send({ error: "Not from Dropbox.", valid })
	console.log("Req method wrong and/or not from Dropbox. Valid: ", valid)
}

function verifyReq(message: string, request: VercelRequest): boolean {
	const signature = request.headers["x-dropbox-signature"]
	const hash = crypto.createHmac("SHA256", DBX_APP_SECRET).update(message).digest("hex")
	return signature == hash
}

// from https://github.com/vercel/vercel/discussions/5213#discussioncomment-563856
function getRawBody(req: VercelRequest): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			console.log("Getting raw body...")
			let bodyChunks = []
			req.on("end", () => {
				const rawBody = Buffer.concat(bodyChunks).toString("utf8")
				console.log("Got raw body...")
				resolve(rawBody)
			})
			req.on("data", (chunk) => bodyChunks.push(chunk))
		} catch (e) {
			reject(e)
		}
	})
}
