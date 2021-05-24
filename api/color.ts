const chrome = require("chrome-aws-lambda")
const Color = require("color")

const maxWidth = 4096
const maxHeight = 4096
const defaultWidth = 1920
const defaultHeight = 1080

module.exports = async (req, res) => {
	try {
		var width, height

		const object = {
			args: chrome.args,
			executablePath: await chrome.executablePath,
			headless: true
		}
		const browser = await chrome.puppeteer.launch(object)

		if (!req.query.color) {
			res.send(
				`Usage: "/color/blue", "/color/#00ff00", or "/color/rgb(0,255,0)". To specify a size, use "/color/(your color)/(width in px)/(height in px)". Width defaults to ${defaultWidth}, and maxes out at ${maxWidth}. Height defaults to ${defaultHeight}, and maxes out at ${maxHeight}.`
			)
			return true
		}

		if (req.query.width >= maxWidth) {
			width = maxWidth
		} else if (req.query.width == null) {
			width = defaultWidth
		} else {
			width = parseInt(req.query.width)
		}

		if (req.query.height >= maxHeight) {
			height = maxHeight
		} else if (req.query.height == null) {
			height = defaultHeight
		} else {
			height = parseInt(req.query.height)
		}

		const color = Color(req.query.color)

		const page = await browser.newPage()

		await page.setViewport({
			width: width,
			height: height
		})

		// sets a page color
		page.setContent(`<style>body{background-color: ${color.hex()};}</style>`)

		var file = await page.screenshot()

		await browser.close()

		res.statusCode = 200
		res.setHeader("Content-Type", `image/png`)
		res.setHeader(
			"Cache-Control",
			`public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
		)
		res.end(file)
	} catch (e) {
		console.log(e)
		res.json({ error: e })
	}
}
