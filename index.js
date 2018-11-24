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
