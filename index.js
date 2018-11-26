require('dotenv').config();
const express = require('express');
const app = express();
const serveStatic = require('serve-static');
const port = process.env.PORT || 3000;
const http = require("http");
const BOT_TOKEN = process.env.BOT_TOKEN;
const superagent = require('superagent');
const bodyParser = require("body-parser");
const recastai = require('recastai').default;
const request = new recastai.request(BOT_TOKEN, 'en');
const {Translate} = require('@google-cloud/translate');
const projectId = process.env.GOOGLE_PROJECT_ID;
const translate = new Translate ({
	projectId: projectId,
});

const junctionInfoMap = require("./resources/data/info.js");
const agentLang = 'en';

app.use(serveStatic('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/translate", (req, res) => {
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
						let intentMessage = junctionInfoMap[intentsArray[0].slug];
						console.log(intentMessage);
						sendMessageToChat(conversationId, intentMessage, sourceLang);
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
			superagent
				.post('https://api.recast.ai/connect/v1/conversations/' + conversationId + '/messages')
				.send({messages: [{ type: 'text', content: translationBack }]})
				.set('Authorization', 'Token ' + BOT_TOKEN)
				.end(function(err, res) {
					console.log(res);
				});
		}).catch(err => {
			console.error('ERROR: ', err);
		});
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
