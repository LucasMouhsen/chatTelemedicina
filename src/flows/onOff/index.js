const { addKeyword } = require('@bot-whatsapp/bot');
const { esperar } = require('../../utils/sleep');
const { searchDb } = require('../../utils/dbSend')

module.exports = addKeyword(['onsherlock', 'offsherlock'])
    .addAction(async (ctx, { globalState, provider }) => {
        /* const bot = globalState.getMyState()
        console.log(bot); */
        await esperar(30, 45);
        await provider.sendText(`5491131890767@c.us`, 'Encendiendo');
        if (true) {
            const pacientes = await searchDb()
            console.log(pacientes);
            for (const paciente of pacientes) {
                await esperar(30, 45);
                await provider.sendText(`5491131890767@c.us`, paciente.mensaje);
                await provider.sendText(`5491131890767@c.us`, 'Ya termine');
            };
        }
    })