const lib = require("./lib")
console.log(lib.recentCommits())
module.exports = async (req, res) => {
    const data = lib.recentCommits((committed, commits) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({committedToday: committed, recentCommits: commits}))
    })
}