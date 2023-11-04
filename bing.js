let Bingimages = require("./lib/Bingimage")
let CreateChat = require("./lib/CreateChat")
let CreateWs = require("./lib/CreateWs")
let Dialogue = require("./lib/Dialogue")
let solveCaptcha = require("./lib/solveCaptcha")
let {createimage , getimageurl} = require("./lib/Bingimage")
let {Create , GetChatHistory , genRanHex} = require("./lib/CreateChat")
let {createWebSocketConnection , cleanupWebSocketConnection} = require("./lib/CreateWs")
let {chat} = require("./lib/Dialogue")
let {solveCaptchaOneShot} = require("./lib/solveCaptcha")




module.exports = {
    Bingimages,
    CreateChat,
    CreateWs,
    Dialogue,
    solveCaptcha,
    createimage,
    getimageurl,
    Create,
    GetChatHistory,
    genRanHex,
    createWebSocketConnection,
    cleanupWebSocketConnection,
    chat,
    solveCaptchaOneShot
}