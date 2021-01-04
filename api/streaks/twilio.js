console.log("running")
const lib = require("./lib")

module.exports = async (req, res) => {
    res.send(
        "This is meant to be run on a schedule by a GitHub Action. To check out the source, take a look at https://jasonaa.me/g/api/tree/main/api/streaks/twilio.js"
    )
}

const sid = process.env.TWILIO_ACCOUNT_SID
const token = process.env.TWILIO_AUTH_TOKEN
const sender = process.env.TWILIO_PHONE_NO
const recipient = process.env.RECIPIENT_PHONE_NO

// soon i'll implement keeping track of my streak using postgresql!
const streak = 0

if (sid && token && sender && recipient) {
    lib.recentCommits((committed, commits) => {
        const client = require("twilio")(sid, token)
        var message = ""
        if (committed == false) {
            message = `Hey! Looks like you haven't committed to GitHub today! You don't want to lose your streak of ${streak} days, do you?`
        } else {
            message = `Congrats on committing today! You now have a streak of ${streak} days!`
        }
        client.messages
            .create({
                body: message,
                from: sender,
                to: recipient
            })
            .then((message) => console.log(message))
            .catch((e) => console.log(e))
    })
} else {
    console.error("Tried to send a message, but the necessary env vars weren't set! The following vars are present in our environment.", Object.keys(process.env))
    process.exit(1)
}
