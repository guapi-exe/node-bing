const CreateChat = require("./CreateChat")
const {createWebSocketConnection , cleanupWebSocketConnection} = require("./CreateWs")
const Createws = require("./CreateWs")
const solveCaptcha = require("./solveCaptcha");
class Dialogue{
    /**
     * 建立一次bing聊天对话
     * @param clientId
     * @param conversationId
     * @param conversationSignature
     * @param invocationId
     * @param message
     * @param cookie
     * @param agenthttp
     * @returns {Promise} 返回消息或报错
     */
    async chat(clientId,conversationId,conversationSignature,invocationId,message,cookie,agenthttp){
        return new Promise(async (resolve, reject) => {
            const toneOption = 'h3imaginative'//harmonyv3:均衡模式,h3imaginative:创意模式,h3precise:精准模式
            let messageType = 'SearchQuery'
            const obj = {
                arguments: [
                    {
                        source: 'cib',
                        optionsSets: [
                            'nlu_direct_response_filter',
                            'deepleo',
                            'disable_emoji_spoken_text',
                            'responsible_ai_policy_235',
                            'enablemm',
                            toneOption,
                            // 'dagslnv1',
                            // 'sportsansgnd',
                            // 'dl_edge_desc',
                            'noknowimg',
                            // 'dtappid',
                            // 'cricinfo',
                            // 'cricinfov2',
                            'dv3sugg',
                            'gencontentv3',
                            'iycapbing',
                            'iyxapbing'
                        ],
                        allowedMessageTypes: ['ActionRequest', 'Chat', 'Context',
                            // 'InternalSearchQuery', 'InternalSearchResult', 'Disengaged', 'InternalLoaderMessage', 'Progress', 'RenderCardRequest', 'AdsQuery',
                            'SemanticSerp', 'GenerateContentQuery', 'SearchQuery'],
                        sliceIds: [],
                        traceId: genRanHex(32),
                        isStartOfSession: invocationId === 0,
                        scenario: 'Underside',
                        verbosity: 'verbose',
                        message: {
                            locale: 'zh-CN',
                            market: 'zh-CN',
                            region: 'WW',
                            location: 'lat:47.639557;long:-122.128159;re=1000m;',
                            locationHints: [
                                {
                                    country: 'Macedonia',
                                    state: 'Centar',
                                    city: 'Skopje',
                                    zipcode: '1004',
                                    timezoneoffset: 1,
                                    countryConfidence: 8,
                                    cityConfidence: 5,
                                    Center: {
                                        Latitude: 41.9961,
                                        Longitude: 21.4317
                                    },
                                    RegionType: 2,
                                    SourceType: 1
                                }
                            ],
                            author: 'user',
                            inputMethod: 'Keyboard',
                            text: message,
                            messageType,
                            // messageType: 'SearchQuery'
                        },
                        tone: 'Creative',
                        privacy: 'Internal',
                        participant: {
                            id: clientId
                        },
                        spokenTextMode: 'None',
                        conversationId
                    }
                ],
                invocationId: invocationId.toString(),
                target: 'chat',
                type: 4
            }
            let ws = await Createws.prototype.createWebSocketConnection(conversationSignature,agenthttp,cookie)
            let messageJson = JSON.stringify(obj)
            try {
                ws.send(`${messageJson}`)
                let imageTag = ''
                ws.on('message', async (data) => {
                    const objects = data.toString().split('')
                    const events = objects.map((object) => {
                        try {
                            return JSON.parse(object)
                        } catch (error) {
                            return object
                        }
                    }).filter(message => message)

                    //console.log(JSON.stringify(events))
                    switch (events[0].type) {
                        case 1: {
                            let messages = events[0]?.arguments?.[0]?.messages || []
                            message = messages?.[0]
                            if (message?.contentType === 'IMAGE') {
                                imageTag = message?.contentType?.text
                            }
                            return;
                        }
                        case 2: {
                            let result = events[0]?.item?.result
                            let messages = events[0]?.item?.messages || []
                            message = messages?.[messages.length - 1]
                            //console.log(JSON.stringify(messages))
                            if (result?.value == 'ProcessingMessage') {
                                await Createws.prototype.cleanupWebSocketConnection(ws)
                                reject('请等待bing上一个问题回答结束')
                                return;
                            }
                            if (messages.length == 0) {
                                await Createws.prototype.cleanupWebSocketConnection(ws)
                                reject('未知问题')

                                return;
                            }
                            if (message?.author !== 'bot') {
                                if (result.value == "CaptchaChallenge") {
                                    console.log("账号需要进行人机验证")
                                    let captcha = await solveCaptcha.prototype.solveCaptchaOneShot(cookie)
                                    if(captcha.result){
                                        console.log("人机验证通过")
                                    }else {
                                        reject("人机验证未通过")
                                        await Createws.prototype.cleanupWebSocketConnection(ws)
                                    }
                                    return;
                                }
                                if (result) {
                                    if (result?.exception?.indexOf('maximum context length') > -1) {
                                        await Createws.prototype.cleanupWebSocketConnection(ws)
                                        reject('对话长度过长maximum context length')
                                    } else if (result.value === 'Throttled') {
                                        await Createws.prototype.cleanupWebSocketConnection(ws)
                                        reject('该账户的SERP请求已被限流')
                                    }
                                }
                                reject('未知问题')
                                await Createws.prototype.cleanupWebSocketConnection(ws)
                                return;
                            }
                            if (result?.value == 'Success') {
                                console.log(result?.value)

                                let suggestions = messages[1]?.suggestedResponses
                                let suggestionstr = ''
                                for (let suggestion in suggestions) {
                                    suggestionstr += '建议' + (Number(suggestion) + 1) + ':' + suggestions[suggestion].text + '\n'
                                }

                                let str = (messages[1]?.text + '\n' + suggestionstr).trim()
                                if (imageTag.length != 0) {
                                    str = str + '\n' + `你的绘画tag为${imageTag}`
                                }
                                await Createws.prototype.cleanupWebSocketConnection(ws);
                                resolve(str)
                            }
                        }
                    }
                })

            } catch (e) {
                console.log('err:' + e)
            }
        })
    }

}
genRanHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')

module.exports = Dialogue