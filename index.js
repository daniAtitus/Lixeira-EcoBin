const express = require("express")
const app = express()
const path = require("path")
const router = require("./routes/routes")

app.use(express.static(path.join(__dirname, "client")))
app.use(router)

app.get("/", (req,res) =>{
    res.sendFile(path.join(__dirname,"client","login.html"))
})

app.get("/home", (req,res) => {
    res.sendFile(path.join(__dirname, "client", "home.html"))
})

app.listen(8080,() => {
    console.log("Running in port 8080") 
})