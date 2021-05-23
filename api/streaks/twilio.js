console.log("Running...")

import { recentCommits } from "./lib"
import { sendMessage } from "../../lib/sms"

module.exports = async (_, res) => {
	res.send(
		"This is meant to be run on a schedule by a GitHub Action. To check out the source, take a look at https://jasonaa.me/g/api/tree/main/api/streaks/twilio.js"
	)
}

// soon i'll implement keeping track of my streak using postgresql!
const streak = 0

recentCommits((committed, _) => {
	streak += 1
	var message = committed
		? `Congrats on committing today! You now have a streak of ${streak} day${
				streak == 1 ? "" : "s"
		  }!`
		: `Hey! Looks like you haven't committed to GitHub today! You don't want to lose your streak of ${streak} days, do you?`

	sendMessage(message)
})
