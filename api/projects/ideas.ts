const redis = require("redis")
const fetch = require("node-fetch")
import { VercelRequest, VercelResponse } from "@vercel/node"
import { ICard, IAttachment } from "../../types/trello"
require("dotenv").config()

export interface INewCard extends ICard {
	attachments?: IAttachment[]
}

const client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PASS
})

// this is optional, for if you are still needing to identify the ids
const boardId = process.env.TRELLO_BOARD_ID || ""

// these are required at runtime
const key = process.env.TRELLO_KEY || ""
const token = process.env.TRELLO_TOKEN || ""
const listId = process.env.TRELLO_LIST_ID || ""
const INVALIDATE_CACHE_MINS = process.env.INVALIDATE_CACHE_MINS || 15
const REDIS_KEY = "project_ideas"

module.exports = async (_: VercelRequest, res: VercelResponse) => {
	res.setHeader("Content-Type", "application/json")
	try {
		doTheDance((data) => {
			res.send(data)
		})
	} catch (e) {
		res.send(JSON.stringify({ err: e }))
	}
}

function getBoardId(boardName: string) {
	const url = `https://api.trello.com/1/members/me/boards?key=${key}&token=${token}`
	fetch(url)
		.then((res) => res.json())
		.then((json) =>
			console.log(json.filter((board) => board.name == boardName)[0]["id"])
		)
}

// getBoardId("Your Board Name Here!")

function getBoardLists() {
	const urrl = `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`
	fetch(urrl)
		.then((res) => res.json())
		.then((json) => console.log(json))
}

async function getListCards(): Promise<ICard[]> {
	const urrl = `https://api.trello.com/1/lists/${listId}/cards?key=${key}&token=${token}`
	const data = await fetch(urrl)
	const json = await data.json()
	return json
}

function getListCardsAndAttachments(callback: (newCards: ICard[], err?: object) => any) {
	var newCards = []
	getListCards()
		.then((cards) => {
			for (const c of cards) {
				var newCard: INewCard = c
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
		.catch((err) => {
			callback(undefined, err)
		})
}

async function getAttachments(cardId: string): Promise<IAttachment[]> {
	const urrl = `https://api.trello.com/1/cards/${cardId}/attachments?key=${key}&token=${token}`
	const data = await fetch(urrl)
	const json = await data.json()
	return json
}

function getAttachmentsSync(cardId: string, callback) {
	getAttachments(cardId).then(callback)
}

function updateCache(callback: (data: string, err?: object) => any) {
	getListCardsAndAttachments((d, err) => {
		if (!err) {
			const res = JSON.stringify({ data: d, cache_time: new Date() })
			client.set(REDIS_KEY, res, function () {
				if (callback) {
					callback(res)
				}
			})
		} else {
			callback(undefined, err)
		}
	})
}

function getCache(cacheCallback) {
	client.get(REDIS_KEY, (err, res) => {
		cacheCallback(err, res)
	})
}

function doTheDance(callback?: (res: string, err?: string) => any) {
	function errRes(error) {
		callback(
			JSON.stringify({
				err:
					error ||
					`There was no data set for key ${REDIS_KEY} or we had trouble getting it from the cache!`
			})
		)
	}

	client.get(REDIS_KEY, function (err, res) {
		if (err) {
			errRes(err)
			return
		}
		const data = JSON.parse(res)
		if (!data || typeof data != "object") {
			errRes(err)
			return
		}

		const shouldInvalidateCache =
			(new Date().getMilliseconds() - new Date(data.cache_time).getMilliseconds()) /
				60000 >
			INVALIDATE_CACHE_MINS
		if (shouldInvalidateCache) {
			updateCache(function (data, err) {
				if (callback) {
					callback(data, err)
				}
			})
		} else {
			getCache((err, res) => {
				if (err) {
					errRes(err)
					return
				}
				callback(res)
			})
		}
	})
}
