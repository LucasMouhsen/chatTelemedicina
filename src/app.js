require("dotenv").config();
const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000

const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const JsonFileAdapter = require('@bot-whatsapp/database/json');

const flowPrincipal = require('./flows/encuesta')
const flowWelcome = require('./flows/validacion')
const flowOnOff = require('./flows/onOff')

const flows = [
    flowPrincipal,
    flowOnOff
];

const main = async () => {
    const adapterDB = new JsonFileAdapter();
    const adapterFlow = createFlow([...flows]);
    const adapterProvider = createProvider(BaileysProvider);
    await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    },
        {
            state: {
                status: false
            }
        }
    )
};


app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, '..', 'bot.qr.png');

  res.set('Content-Type', 'image/png');

  res.sendFile(imagePath);
})
app.listen(port, () => {
    main();
    console.log(`http://localhost:${port}`)
})
