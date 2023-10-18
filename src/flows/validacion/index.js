const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const { esperar } = require('../../utils/sleep');
const buscarEncuesta = require('../../utils/buscarEncuesta');

const validacion = ['hola', 'encuesta']

module.exports = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { endFlow, flowDynamic, provider }) => {
        await esperar(3, 5)
        await buscarEncuesta(ctx, { endFlow })
        if (!validacion.some(item => ctx.body.includes(item))) {
            return flowDynamic(`📱 +${ctx.from}\n\nPor favor para iniciar la encuesta responda con alguna de las siguientes opciones:\n👋 Hola\n📋 Encuesta`);
        }
        else {
            return
        }
    })
