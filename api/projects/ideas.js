const redis = require("redis")
const fetch = require("node-fetch")

// // this is all for caching, which will come when i have functioning code
// const { promisify } = require("util");
// const client = redis.createClient();
// const getAsync = promisify(client.get).bind(client);

const key = process.env.TRELLO_KEY || ""
const token = process.env.TRELLO_TOKEN || ""
const boardId = process.env.TRELLO_BOARD_ID || ""
const listId = process.env.TRELLO_LIST_ID || ""

module.exports = async (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify({msg: "literally nothing lol"}))
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

function getListCardsAndAttachments(callback) {
    var newCards = []
    getListCards().then((cards) => {
        for (const c of cards) {
            var newCard = c
            const attachmentsPresent = newCard.badges.attachments > 0
            if (attachmentsPresent) {
                getAttachmentsSync(newCard.id, (val) => {
                    newCard.attachments = val
                    newCards.push(newCard)
                    if (newCards.length == cards.length) {
                        callback(newCards)
                    }
                })
            } else {
                newCards.push(newCard)
                if (newCards.length == cards.length) {
                    callback(newCards)
                }
            }
        }
    })
}

async function getAttachments(cardId) {
    const urrl = `https://api.trello.com/1/cards/${cardId}/attachments?key=${key}&token=${token}`
    const data = await fetch(urrl)
    const json = await data.json()
    return json
}

function getAttachmentsSync(cardId, callback) {
    getAttachments(cardId).then(callback)
}

getListCardsAndAttachments(console.log)
// getListCardsAndAttachments()
