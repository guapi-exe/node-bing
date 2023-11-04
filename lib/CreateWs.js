let {HttpsProxyAgent} = require('https-proxy-agent');
let { solveCaptchaOneShot } = require('./solveCaptcha')
let ws = require('ws');
class CreateWs{
    /**
     * 创建ws链接
     * @param encryptedconversationsignature 加码的签证密钥
     * @param agenthttp 代理
     * @param cookie
     * @returns {Promise} 返回ws对象
     */
    async createWebSocketConnection (encryptedconversationsignature,agenthttp,cookie) {
        let WebSocket = ws
        return new Promise((resolve, reject) => {
            let agent = new HttpsProxyAgent(agenthttp)
            let sydneyHost = 'wss://sydney.bing.com/sydney/ChatHub'
            let url = sydneyHost +`?sec_access_token=${encodeURIComponent(encryptedconversationsignature)}`
            let ws = new WebSocket(url , undefined , { agent , origin: 'https://edgeservices.bing.com'})
            ws.on('error', (err) => {
                console.error(err)
                reject(err)
            })

            ws.on('open', () => {
                ws.send('{"protocol":"json","version":1}')
            })

            ws.on('close', () => {
                new solveCaptchaOneShot(cookie)
            })

            ws.on('message', (data) => {
                const objects = data.toString().split('')
                const messages = objects.map((object) => {
                    try {
                        return JSON.parse(object)
                    } catch (error) {
                        return object
                    }
                }).filter(message => message)
                if (messages.length === 0) {
                    return
                }
                if (typeof messages[0] === 'object' && Object.keys(messages[0]).length === 0) {
                    ws.bingPingInterval = setInterval(() => {
                        ws.send('{"type":6}')
                    }, 15 * 1000)
                    resolve(ws)

                }
            })
        })
    }
    /**
     * 清理ws对象
     * @param ws 传入ws对象
     */
    async cleanupWebSocketConnection (ws) {
        clearInterval(ws.bingPingInterval)
        ws.close()
        ws.removeAllListeners()
    }
}

module.exports = CreateWs