const express = require('express');
const app = express()
const serveStatic = require('serve-static')
const port = process.env.PORT || 3000
const http = require("http")

const superagent = require('superagent');

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
const projectId = 'alien-paratext-223508';

// Instantiates a client
const translate = new Translate({
	projectId: projectId,
});

app.use(serveStatic('public'))

app.get("/disruption", (req,res) => {

})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/test", (req,res) => {
	const conversationId = req.body.conversation.id;

	superagent
		.post('https://api.recast.ai/connect/v1/conversations/'+conversationId+'/messages')
		.send({messages: [{ type: 'text', content: 'test' }]})
		.set('Authorization', 'Token 40d5fa3351bbc08183f3e9b3f92fba80')
		.end(function(err, res) {
			console.log(res);
		});
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))





app.get("/translate/:text", (req, res) => {

	// The text to translate
	const text = req.params.text;
	// The target language
	const target = 'en';

	let sourceLang;

	// Translates some text into Russian
	translate
		.translate(text, target)
		.then(results => {
			sourceLang = results[1].data.translations[0].detectedSourceLanguage;
			const translation = results[0];

			console.log(`Text: ${text}`);
			console.log(`Translation: ${translation}`);

			let result;
			if (translation === "Hello") {
				result = "How can I help you?";
			} else {
				result = translation;
			}

			translate
				.translate(result, sourceLang)
				.then(results => {
					const translationBack = results[0];
					console.log(`Translation back: ${translationBack}`);
					res.send(translationBack);
				})
				.catch(err => {
					console.error('ERROR:', err);
				});
		})
		.catch(err => {
			console.error('ERROR:', err);
		});



})
