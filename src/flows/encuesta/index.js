const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const { updateQuestion } = require('../../middleware/google/sheets');
const fs = require('fs');
const { esperar } = require('../../utils/sleep');
const buscarEncuesta = require('../../utils/buscarEncuesta');
const capitalizeOneLetter = require('../../utils/capitalizeOneLetter');
const { searchSheet } = require('../../middleware/google/searchSheet');

const siNo = ['si', 'no'];
const validacion = ['hola', 'encuesta']



module.exports = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { endFlow, state, provider }) => {
        const myState = state.getMyState() || false
        if (!myState.trabajando) {
            await state.update({trabajando: true})
            const paciente = await buscarEncuesta(ctx, { endFlow })
            if (paciente.RESPONDIO == 'SI') {
                await state.update({trabajando: false})
                endFlow()
            }
            else if (!validacion.some(item => ctx.body.includes(item))) {
                state.update({trabajando: false})
                endFlow(`📱 +${ctx.from}\n\nPor favor para iniciar la encuesta responda con alguna de las siguientes opciones:\n👋 Hola\n📋 Encuesta`);
            }
        }
        else{
            await state.update({trabajando: false})
            endFlow()
        }
        /* state.update({ paciente: paciente }) */
        await esperar(1, 3)
        await state.update({trabajando: false})
    })
    .addAction(
        async (ctx, { fallBack, state, provider }) => {
            const numero = ctx.from
            /* primer pregunta */
            await provider.sendText(`${numero}@c.us`, `📱 +${numero}\n\n1️⃣ ¿Cuál es su nivel de satisfacción con la atención profesional recibida?`);
            await esperar(1, 2)
        })
    .addAnswer('👉 Responder del 1 al 10', { capture: true },
        async (ctx, { fallBack, state }) => {
            const ctxNumber = ctx.body.replace(/[^0-9]/g, '');
            if (ctxNumber <= 10 && 0 <= ctxNumber) {
                state.update({ quest1: ctx.body })
                await esperar(1,3)
            } else {
                await esperar(1,3)
                return fallBack();
            }
        }
    )
    .addAction(
        async (ctx, { fallBack, state, provider }) => {
            const numero = ctx.from
            const persona = state.getMyState() || false
            /* primer pregunta */
            await provider.sendText(`${numero}@c.us`, `📱 +${numero}\n\n2️⃣ ¿La consulta realizada ayuda a resolver su problema?`);
            await esperar(1,2)
        })
    .addAnswer(
        [
            '👉 Responder con SI o NO'
        ],
        { capture: true },
        async (ctx, { fallBack, state }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                await esperar(1,3)
                return fallBack();
            } else {
                state.update({ quest2: ctx.body })
                await esperar(1,3)
            }
        }
    )
    .addAction(
        async (ctx, { fallBack, state, provider }) => {
            const numero = ctx.from
            /* primer pregunta */
            await provider.sendText(`${numero}@c.us`, `📱 +${numero}\n\n3️⃣ ¿Recomendaría este tipo de atención a otra persona?\n`);
            await esperar(1,2)
        })
    .addAnswer(
        ['👉 Responder con SI o NO'],
        { capture: true },
        async (ctx, { fallBack, state }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                await esperar(1,3)
                return fallBack();
            } else {
                state.update({ quest3: ctx.body })
                await esperar(1,3)
            }
        }
    )
    .addAction(async (ctx, { state, endFlow }) => {
        const myState = state.getMyState()
        const numero = ctx.from
        try {
            const pacientes = await searchSheet()

            // Recorrer el array al revés
            for (let i = pacientes.length - 1; i >= 0; i--) {
                // Encontrar el último registro
                if (pacientes[i].CONTACTO === numero) {
                    const pregunta1 = myState.quest1.replace(/[^0-9]/g, '')
                    const pregunta2 = myState.quest2.toLowerCase();
                    const pregunta3 = myState.quest3.toLowerCase();
                    /* Pregunta 1 */
                    await updateQuestion(9, pacientes[i].TURNCODIGO, pregunta1);
                    /* Pregunta 2 */
                    if (pregunta2.includes('si')) {
                        await updateQuestion(10, pacientes[i].TURNCODIGO, 'SI');
                    } else if (pregunta2.includes('no')) {
                        await updateQuestion(10, pacientes[i].TURNCODIGO, 'NO');
                    }
                    /* Pregunta 3 */
                    if (pregunta3.includes('si')) {
                        await updateQuestion(11, pacientes[i].TURNCODIGO, 'SI');
                    } else if (pregunta3.includes('no')) {
                        await updateQuestion(11, pacientes[i].TURNCODIGO, 'NO');
                    }
                    await updateQuestion(8, pacientes[i].TURNCODIGO, 'SI');
                    return endFlow(`📱 +${numero}\n\n¡Muchas gracias por compartir tu respuesta! 😊🙏`)
                }
            }

        } catch (error) {
            console.error("Error al leer o escribir el archivo JSON:", error);
        }
    })