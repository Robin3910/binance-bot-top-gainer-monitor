const axios = require('axios');

function transTimeStampToDate(timeStamp) {
    const date = new Date(timeStamp);
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = date.getDate() + ' ';
    const h = date.getHours() + ':';
    const m = date.getMinutes() + ':';
    const s = date.getSeconds();
    return Y + M + D + h + m + s;
}

function notifyToPhone(title, content) {
    // 1 buy 0 sell
    const config = {
        method: 'get',
        url: `https://sctapi.ftqq.com/SCT143186TIvKuCgmwWnzzzGQ6mE5qmyFU.send?title=${title}&desp=${encodeURIComponent(content)}`,
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
}
async function sleep(time) {
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve();
        }, time);
    })
}

module.exports = {
    transTimeStampToDate,
    notifyToPhone,
    sleep
}