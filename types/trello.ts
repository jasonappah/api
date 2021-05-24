// Interfaces are largely copied from https://developer.atlassian.com/cloud/trello/guides/rest-api/object-definitions/
export interface ICard {
	id: string
	badges: { attachments: number }
	checkItemStates: any[]
	closed: boolean
	dateLastActivity: Date | string
	desc: string
	descData: object
	due: Date | string
	dueComplete: boolean
	idAttachmentCover: string
	idBoard: string
	idChecklists: string[]
	idLabels: string[]
	idList: string
	idMembers: string[]
	idMembersVoted: string[]
	idShort: number
	labels: any[]
	manualCoverAttachment: boolean
	name: string
	pos: number
	shortLink: string
	shortUrl: string
	subscribed: boolean
	url: string
	address?: string
	locationName?: string
	coordinates?: object
}

export interface IAttachment {
	id: string
	bytes: number
	date: string
	edgeColor: string
	idMember: string
	isUpload: boolean
	mimeType: string
	name: string
	pos: number
	previews?: string[]
	url: string
}
