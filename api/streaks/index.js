const {Octokit} = require("@octokit/rest")

const octokit = new Octokit({
    userAgent: "streaks-api"
    // auth: process.env.GITHUB_PAT
})
const tz = "America/Chicago"
const user = "jasonappah"

module.exports = async (req, res) => {res.send("soon come.")}

function recentCommits() {
    octokit.activity
        .listPublicEventsForUser({
            username: user
        })
        .then((res) => {
            const latestCheck = new Date(0)
            // gets current date-time in my timezone
            const today = new Date(new Date().toLocaleString("en-US", {timeZone: tz})) // timezone ex: Asia/Jerusalem
            const thisYear = today.getYear()
            const thisDay = today.getDay()
            const thisMonth = today.getMonth()
            const thisWeek = getWeekNumber(today)

            var committedToday = false
            const pushes = res.data.filter((entry) => entry.type == "PushEvent")
            var commits = {latest: {}, today: [], thisWeek: [], earlier: [], all: []}
            for (let push of pushes) {
                // this date is in UTC by default, so we convert it to my local timezone
                const date = new Date(
                    new Date(push.created_at).toLocaleString("en-US", {timeZone: tz})
                )

                commits.all = [...commits.all, ...push.payload.commits]

                if (
                    thisYear == date.getYear() &&
                    thisDay == date.getDay() &&
                    thisMonth == date.getMonth()
                ) {
                    committedToday = true
                    commits.today = [...commits.today, ...push.payload.commits]
                } else if (thisWeek == getWeekNumber(date)) {
                    commits.thisWeek = [...commits.thisWeek, ...push.payload.commits]
                } else {
                    commits.earlier = [...commits.earlier, ...push.payload.commits]
                }
            }
            commits.latest = commits.all[0]
            console.log(committedToday, commits)
            return [committedToday, commits]
        })
}

// "borrowed" from https://stackoverflow.com/a/6117889
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo]
}
