const redis = require("redis")
const fetch = require("node-fetch")

// const { promisify } = require("util");
// const client = redis.createClient();
// const getAsync = promisify(client.get).bind(client);

const key = process.env.TRELLO_KEY || ""
const token = process.env.TRELLO_TOKEN || ""
const boardId = process.env.TRELLO_BOARD_ID || ""
const listId = process.env.TRELLO_LIST_ID || ""

module.exports = async (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify({msg:"literally nothing lol"}))
}

function getBoardId(boardName) {
    const url = `https://api.trello.com/1/members/me/boards?key=${key}&token=${token}`
    fetch(url)
        .then((res) => res.json())
        .then((json) =>
            console.log(json.filter((board) => board.name == boardName)[0]["id"])
        )
}

// getBoardId("Stuff")

function getBoardLists() {
    const urrl = `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`
    fetch(urrl)
        .then((res) => res.json())
        .then((json) => console.log(json))
}

async function getListCards() {
    const urrl = `https://api.trello.com/1/lists/${listId}/cards?key=${key}&token=${token}`
    const data = await fetch(urrl)
    const json = await data.json()
    return json
}


getListCards().then((dat) => console.log(dat))