let { fetch } = require("cross-fetch");

class SolveCaptcha{
    /**
     * 过人机验证
     * @returns {Promise} 返回消息或报错
     * @param token bingtoken
     */
    async solveCaptchaOneShot (token) {
        if (!token) {
            throw new Error('no token')
        }
        let solveUrl = 'http://bingcaptcha.ikechan8370.com/bing'
        if (!solveUrl) {
            throw new Error('no captcha source')
        }
        let result = await fetch(solveUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _U: token
            })
        })
        if (result.status === 200) {
            return await result.json()
        } else {
            return {
                success: false,
                error: result.statusText
            }
        }
    }
}
module.exports = SolveCaptcha