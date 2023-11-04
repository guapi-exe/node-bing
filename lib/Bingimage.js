let {HttpsProxyAgent} = require('https-proxy-agent');
let { fetch } = require("cross-fetch");
class Bingimage{
    /**
     * 创建bing图像，获取所需的url链接
     * @param tag 要画的图片内容
     * @param cookie bingtoken
     * @param agenthttp 代理
     * @returns {Promise} 返回用于获取图像的url数据或报错
     */
    async createimage (tag, cookie ,agenthttp) {
        let urlEncodedPrompt = encodeURIComponent(tag)//url加码
        let url = `https://edgeservices.bing.com/images/create?q=${urlEncodedPrompt}&rt=3&FORM=GENCRE`
        let headers = {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/x-www-form-urlencoded',
            origin: 'https://edgeservices.bing.com',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.50',
            cookie: `_U=${cookie}`,
            'x-forwarded-for': '1.1.1.1'

        }

        let fetchOptions = {
            headers: headers
        }
        if(agenthttp){
            fetchOptions.agent = new HttpsProxyAgent(agenthttp)
        }
        let from = new FormData()
        from.append('q', tag)
        from.append('qs', 'ds')//创建伪请求表单数据
        let res
        let response
        try {
            response = await fetch(url, Object.assign(fetchOptions, {body: from, redirect: 'manual', method: 'POST'}))
            res = await response.text()
        } catch (s) {
            return new Error(s)
        }
        if (res.toLowerCase().includes('this prompt has been blocked')) {
            throw new Error('你的绘画中有被bing所阻止违禁词')
        }
        if (response.status !== 302) {
            url = `https://edgeservices.bing.com/images/create?q=${urlEncodedPrompt}&rt=3&FORM=GENCRE`
            let response3
            try {
                response3 = await fetch(url, Object.assign(fetchOptions, {
                    body: from,
                    redirect: 'manual',
                    method: 'POST'
                }))
            } catch (s) {
                return new Error(s)
            }
            if (response3.status !== 302) {
                throw new Error('绘图失败，请检查Bing token和代理/反代配置')
            }
            response = response3
        }
        let redirectUrl = response.headers.get('Location').replace('&nfy=1', '')
        let requestId = redirectUrl.split('id=')[1]
        return `https://edgeservices.bing.com/images/create/async/results/${requestId}?q=${urlEncodedPrompt}`
    }
    /**
     * 创建bing图像，获取所有图像链接
     * @param url 绘画获取的地址
     * @param cookie bingtoken
     * @param agenthttp 代理
     * @returns {Promise} 返回图像的url数据或报错
     */
    async getimageurl(url, cookie , agenthttp){
        return new Promise(async (resolve, reject) => {
            let timeoutTimes = 80
            let found = false
            let headers = {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/x-www-form-urlencoded',
                origin: 'https://edgeservices.bing.com',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.50',
                cookie: `_U=${cookie}`,
                'x-forwarded-for': '1.1.1.1'

            }

            let fetchOptions = {
                headers: headers
            }
            if (agenthttp) {
                fetchOptions.agent = new HttpsProxyAgent(agenthttp)
            }
            let timer = setInterval(async () => {
                if (found) {
                    return;
                }

                let form = new FormData()//这jb空表单也要回传
                let html = await fetch(url, Object.assign(fetchOptions, {method: 'POST', body: form}))
                let rText = await html.text()
                if (rText) {
                    found = true


                    let regex = /src="([^"]+)"/g
                    let imageLinks = rText.match(regex)
                    if (!imageLinks || imageLinks.length === 0) {
                        reject('no images')
                    }
                    imageLinks = imageLinks.map(link => link.split('?w=')[0]).map(link => link.replace('src="', ''))
                    imageLinks = [...new Set(imageLinks)]
                    const badImages = [
                        'https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png',
                        'https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg'
                    ]
                    for (let imageLink of imageLinks) {
                        if (badImages.indexOf(imageLink) > -1) {
                            reject('绘图失败：Bad images')

                        }
                    }
                    if (rText.toLowerCase().includes('we can\'t create your images right now')) {
                        clearInterval(timer)
                        reject('bing无法处理你的图像请求')

                    }
                    clearInterval(timer)
                    resolve(imageLinks)
                } else {
                    if (timeoutTimes === 0) {
                        clearInterval(timer)
                        reject('绘图超时')

                    } else {
                        console.log('绘画等等待中: ' + timeoutTimes)
                        timeoutTimes--
                    }
                }
            }, 8000)
        })
    }
}

module.exports = Bingimage