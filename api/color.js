const puppeteer = require("puppeteer");
const maxWidth = 4096;
const maxHeight = 4096;
const defaultWidth = 1920;
const defaultHeight = 1080;

async function thing(req, res) {
  var width, height;

  const browser = await puppeteer.launch();

  if (!req.query.color) {
    res.send(
      "Specify the URL param `color` to get started, by adding the following to the end of this URL: `?color=blue`. Color can be a CSS color like `blue`, a hex code like `#00ff00`, or an RGB color like `rgb(0,255,0)`." +
        `You can also specify the params \`width\` and \`height\` to get an image with certain dimensions. Width defaults to ${defaultWidth}, and maxes out at ${maxWidth}. Height defaults to ${defaultHeight}, and maxes out at ${maxHeight}.`
    );
    return true;
  }

  if (req.query.width >= maxWidth) {
    width = maxWidth;
  } else if (req.query.width == null) {
    width = defaultWidth;
  } else {
    width = parseInt(req.query.width);
  }

  if (req.query.height >= maxHeight) {
    height = maxHeight;
  } else if (req.query.height == null) {
    height = defaultHeight;
  } else {
    height = parseInt(req.query.height);
  }

  const color = req.query.color;

  const page = await browser.newPage();

  await page.setViewport({
    width: width,
    height: height,
  });

  // sets a page color
  page.setContent(`<style>body{background-color: ${color};}</style>`);

  // loads a page, but we don't need that for this purpose. just here for reference
  // page.goTo("someurl")

  var file = await page.screenshot();

  await browser.close();

  res.statusCode = 200;
  res.setHeader("Content-Type", `image/png`);
  res.setHeader(
    "Cache-Control",
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
  );
  res.end(file);
}

module.exports = (req, res) => {
  thing(req, res);
};
