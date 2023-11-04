let {HttpsProxyAgent} = require('https-proxy-agent');
let delay = require("delay");
let { fetch } = require("cross-fetch");
class CreateChat{
    async Create(cookie,agenthttp) {
        const fetchOptions = {
            headers: {
                accept: 'application/json',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                'content-type': 'application/json',
                cookie: `_U=${cookie};`,
                Referer: 'https://edgeservices.bing.com/edgesvc/chat?udsframed=1&form=SHORUN&clientscopes=chat,noheader,channelstable,'

            }
        }
        if(agenthttp){
            fetchOptions.agent = new HttpsProxyAgent(agenthttp)
        }
        let response
        try {
            response = await fetch('https://edgeservices.bing.com/edgesvc/turing/conversation/create', fetchOptions)
        }catch (s) {
            return new Error(s)
        }
        let text = await response.text()
        let times = 10
        while (times >= 0 && response.status === 200 && !text) {
            await delay(1000)
            response = await fetch(`https://edgeservices.bing.com/edgesvc/turing/conversation/create`, fetchOptions)
            text = await response.text()
            times--
        }
        if (response.status !== 200) {
            throw new Error('创建对话失败:' + response.status + response.statusText)
        }
        try {
            let ret = JSON.parse(text)
            ret.encryptedconversationsignature = response.headers.get('x-sydney-encryptedconversationsignature')
            return ret
        } catch (err) {
            return new Error(text)
        }
    }
    async GetChatHistory(cookie,agenthttp) {
        const fetchOptions = {
            headers: {
                accept: 'application/json',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                'content-type': 'application/json',
                cookie: `_U=${cookie};`,
                Referer: 'https://edgeservices.bing.com/edgesvc/chat?udsframed=1&form=SHORUN&clientscopes=chat,noheader,channelstable,'

            }
        }
        if(agenthttp){
            fetchOptions.agent = new HttpsProxyAgent(agenthttp)
        }
        let response
        try {
            response = await fetch('https://edgeservices.bing.com/edgesvc/turing/conversation/chats', fetchOptions)
        }catch (s) {
            return new Error(s)
        }
        let text = await response.text()
        let times = 10
        while (times >= 0 && response.status === 200 && !text) {
            await delay(1000)
            response = await fetch(`https://edgeservices.bing.com/edgesvc/turing/conversation/chats`, fetchOptions)
            text = await response.text()
            times--
        }
        if (response.status !== 200) {
            throw new Error('获取对话失败:' + response.status + response.statusText)
        }
        try {
            let ret = JSON.parse(text)
            ret.encryptedconversationsignature = response.headers.get('x-sydney-encryptedconversationsignature')
            return ret
        } catch (err) {
            return new Error(text)
        }
    }
    genRanHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}
module.exports = CreateChat