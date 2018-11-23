const express = require('express');
const app = express();
const serveStatic = require('serve-static')
const port = process.env.PORT || 3000;


app.use(serveStatic('public'))

app.get("/disruption", (req,res) => {
    

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))