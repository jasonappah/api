import { recentCommits } from "./lib"

module.exports = async (_, res) => {
	try {
		recentCommits((committed, commits) => {
			res.setHeader("Content-Type", "application/json")
			res.send(
				JSON.stringify({ committedToday: committed, recentCommits: commits })
			)
		})
	} catch (e) {
		res.setHeader("Content-Type", "application/json")
		res.send(JSON.stringify({ error: e }))
	}
}
