'use strict';
const config = require('../config/config');
const util = require('../util/common');
const api = require('../util/api');
const fs = require('fs');
// 导入WebSocket模块
const WebSocket = require('ws');

const coinMap = {};

// websocket连接对象
let ws;

function updateCoinMap(msgData) {
    for (const coinData of msgData) {
        const name = coinData["s"];
        if (!coinMap[name]) {
            coinMap[name] = {};
        }
        if (coinMap[name]["percent"]) {
            if (coinMap[name]["percent"] - parseFloat(coinData["P"]) >= config.EXCEED_PERCENT) {
                util.notifyToPhone(0, `${name} exceed percent over ${config.EXCEED_PERCENT}|cur percent: ${parseFloat(coinData["P"])}`);
            }
            if (parseFloat(coinData["P"]) >= config.TODAY_LIMIT) {
                if (coinMap[name]["lastNotifyTs"]) {
                    if (new Date().getTime() - coinMap[name]["lastNotifyTs"] >= config.NOTIFY_INTERVAL) {
                        util.notifyToPhone(0, `${name} gain percent over ${config.TODAY_LIMIT}`);
                        coinMap[name]["lastNotifyTs"] = new Date().getTime();
                    }
                } else {
                    util.notifyToPhone(0, `${name} gain percent over ${config.TODAY_LIMIT}`);
                    coinMap[name]["lastNotifyTs"] = new Date().getTime();
                }
            }
        }
        coinMap[name]["price"] = coinData["p"];
        coinMap[name]["percent"] = parseFloat(coinData["P"]);
    }
}


function start() {
    if (ws) {
        ws.close();
    }
    // 生成listenKey并订阅市场消息
    api.createListenKey().then((data) => {
        console.log(`listenKey: ${data.listenKey}`);
        ws = new WebSocket(`wss://fstream-auth.binance.com/ws/!ticker@arr?listenKey=${data.listenKey}`);

        // 打开WebSocket连接后立刻发送一条消息:
        ws.on('open', function () {
            console.log(`[CLIENT] open()`);
            ws.send('Hello garlic chives!');
        });

        ws.on('close', function (m) {
            console.log(`[CLIENT] close(), ${m}`);
            ws.send('ws connection close!');
        });
        ws.on('error', function (m) {
            console.log(`[CLIENT] error(), ${m}`);
            ws.send('ws connection error!');
        });
        ws.on('ping', (e) => { //Defines callback for ping event
            console.log(`${util.transTimeStampToDate(Date.now())}, get server ping `);
            ws.pong(); //send pong frame
        });
        // 响应收到的消息:
        ws.on('message', async function (message) {
            ws.pong();
            const msgData = JSON.parse(message.toString());
            if (msgData['error']) {
                console.log('error msg: ', msgData['error']);
                return;
            }

            updateCoinMap(msgData);
        });
    });
}

start();
