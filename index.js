const express = require('express');
const app = express()
const serveStatic = require('serve-static')
const port = process.env.PORT || 3000
const http = require("http")
const BOT_TOKEN = '40d5fa3351bbc08183f3e9b3f92fba80'
const superagent = require('superagent');
const bodyParser = require("body-parser");
var recastai = require('recastai').default
var request = new recastai.request(BOT_TOKEN, 'en')

const junctionInfoMap = require("./Resources/Data/JunctionInfo.js");

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
const projectId = 'alien-paratext-223508';

// Instantiates a client
const translate = new Translate({
	projectId: projectId,
});

const agentLang = 'en';

app.use(serveStatic('public'))

app.get("/disruption", (req,res) => {

})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/test", (req,res) => {
	const conversationId = req.body.conversation.id;
	superagent
		.post('https://api.recast.ai/connect/v1/conversations/'+conversationId+'/messages')
		.send({messages: [{ type: 'text', content: 'Hello World' }]})
		.set('Authorization', 'Token ' + BOT_TOKEN)
		.end(function(err, res) {
			console.log(res);
		});

	res.json({});
})

app.post("/test2", (req, res) => {
	const originalMessage = req.body.nlp.source;
	const conversationId = req.body.conversation.id;

	translate
		.translate(originalMessage, agentLang)
		.then(results => {
			const sourceLang = results[1].data.translations[0].detectedSourceLanguage;
			const translation = results[0];

			request
				.analyseText(translation)
				.then(analysed => {
					const response = analysed.raw;
					let intentsArray = response.intents;
					if (intentsArray.length == 0) {
						sendMessageToChat(conversationId, 'I will forward you to the agent', sourceLang);
					} else {
						intentsArray.sort((i1, i2) => i2.confidence - i1.confidence);
						sendMessageToChat(conversationId, junctionInfoMap[intentsArray[0].slug], sourceLang);
					}
					res.json({});
				});
		}).catch(err => {
			console.error('ERROR:', err);
		});
})

function sendMessageToChat(conversationId, message, lang) {
	translate
		.translate(message, lang)
		.then(results => {
			const translationBack = results[0];
			console.log(`Translation back: ${translationBack}`);

			superagent
				.post('https://api.recast.ai/connect/v1/conversations/'+conversationId+'/messages')
				.send({messages: [{ type: 'text', content: translationBack }]})
				.set('Authorization', 'Token ' + BOT_TOKEN)
				.end(function(err, res) {
					console.log(res);
				});
		}).catch(err => {
			console.error('ERROR:', err);
		});
}
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
