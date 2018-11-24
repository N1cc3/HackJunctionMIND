const express = require('express');
const app = express()
const serveStatic = require('serve-static')
const port = process.env.PORT || 3000
const http = require("http")

app.use(serveStatic('public'))

app.get("/disruption", (req,res) => {

})

app.get("/test", (req,res) => {
	res.json({
		"replies": [
			{
				"type": "text",
				"content": "Test success!"
			}
		]
	});
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
const projectId = 'alien-paratext-223508';

// Instantiates a client
const translate = new Translate({
  projectId: projectId,
});


app.get("/translate/:text", (req, res) => {

	// The text to translate
	const text = req.params.text;
	// The target language
	const target = 'en';

	let result = '';
	// Translates some text into Russian
	translate
		.translate(text, target)
		.then(results => {
			const translation = results[0];

			console.log(`Text: ${text}`);
			console.log(`Translation: ${translation}`);

			result = translation;
		})
		.catch(err => {
			console.error('ERROR:', err);
		});
	res.send(result);
})
