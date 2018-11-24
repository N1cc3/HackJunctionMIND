const express = require('express');
const app = express()
const serveStatic = require('serve-static')
const port = process.env.PORT || 3000
const http = require("http")

app.use(serveStatic('public'))

app.get("/disruption", (req,res) => {

})

app.get("/test", (req,res) => {
	res.send('test');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// Keep Heroku server alive
setInterval(function() {
	http.get(process.env.HEROKUAPP)
}, 300000) // every 5 minutes
