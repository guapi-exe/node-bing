let {HttpsProxyAgent} = require('https-proxy-agent');
let delay = require("delay");
let { fetch } = require("cross-fetch");
class CreateChat{
    /**
     * 创建bing聊天，获取对话所需的签证
     * @param cookie
     * @param agenthttp
     * @returns {Promise} 返回json数据或报错
     */
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
    /**
     * 创建bing聊天记录
     * @param cookie
     * @param agenthttp
     * @returns {Promise} 返回json数据或报错
     */
    async GetChatHistory(cookie,agenthttp) {//获取聊天记录
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
            return JSON.parse(text)
        } catch (err) {
            return new Error(text)
        }
    }

}
module.exports = CreateChat