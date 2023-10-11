const { addKeyword } = require('@bot-whatsapp/bot');
const { updateQuestion } = require('../../middleware/google/sheets');
const fs = require('fs');
const { esperar } = require('../../utils/sleep');
const buscarEncuesta = require('../../utils/buscarEncuesta');
const capitalizeOneLetter = require('../../utils/capitalizeOneLetter');

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const siNo = ['si', 'no'];
const validacion = ['hola', 'encuesta']



module.exports = addKeyword(validacion)
    .addAction(async (ctx, { endFlow, state, provider }) => {
        let paciente = await buscarEncuesta(ctx, { endFlow })
        state.update({ paciente: paciente })
        await esperar(5, 10)
    })
    .addAction(
        async (ctx, { fallBack, state, provider }) => {
            const numero = ctx.from
            const persona = state.getMyState() || false
            /* primer pregunta */
            await provider.sendText(`${numero}@c.us`, `📱 +${numero}\n1️⃣ ¿Cuál es su nivel de satisfacción con la atención profesional recibida?`);
            await esperar(5, 10)
        })
    .addAnswer('👉 Responder del 1 al 10', { capture: true },
        async (ctx, { fallBack, state }) => {
            if (!numbers.some(item => ctx.body.includes(item))) {
                await esperar(5, 10)
                return fallBack();
            } else {
                state.update({ quest1: ctx.body })
                await esperar(5, 10)
            }
        }
    )
    .addAction(
        async (ctx, { fallBack, state, provider }) => {
            const numero = ctx.from
            const persona = state.getMyState() || false
            /* primer pregunta */
            await provider.sendText(`${numero}@c.us`, `📱 +${numero}\n2️⃣ ¿La consulta realizada ayuda a resolver su problema?`);
            await esperar(5, 10)
        })
    .addAnswer(
        [
            '👉 Responder con SI o NO'
        ],
        { capture: true },
        async (ctx, { fallBack, state }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                await esperar(5, 10)
                return fallBack();
            } else {
                state.update({ quest2: ctx.body })
                await esperar(5, 10)
            }
        }
    )
    .addAction(
        async (ctx, { fallBack, state, provider }) => {
            const numero = ctx.from
            const persona = state.getMyState() || false
            /* primer pregunta */
            await provider.sendText(`${numero}@c.us`, `📱 +${numero}\n3️⃣ ¿Recomendaría este tipo de atención a otra persona?\n`);
        })
    .addAnswer(
        ['👉 Responder con SI o NO'],
        { capture: true },
        async (ctx, { fallBack, state }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                await esperar(5, 10)
                return fallBack();
            } else {
                state.update({ quest3: ctx.body })
                await esperar(5, 10)
            }
        }
    )
    .addAction(async (ctx, { state, endFlow }) => {
        const myState = state.getMyState()
        const numero = ctx.from
        try {
            const data = fs.readFileSync('dbPy.json', 'utf8');
            const pacientes = JSON.parse(data);

            // Recorrer el array al revés
            for (let i = pacientes.length - 1; i >= 0; i--) {
                // Encontrar el último registro
                if (pacientes[i].NUMERO === numero) {
                    const pregunta1 = myState.quest1.replace(/[^0-9]/g, '')
                    const pregunta2 = myState.quest2.toLowerCase();
                    const pregunta3 = myState.quest3.toLowerCase();
                    /* Pregunta 1 */
                    await updateQuestion(8, pacientes[i].TURNCODIGO, pregunta1);
                    /* Pregunta 2 */
                    if (pregunta2.includes('si')) {
                        await updateQuestion(9, pacientes[i].TURNCODIGO, 'SI');
                    } else if (pregunta2.includes('no')) {
                        await updateQuestion(9, pacientes[i].TURNCODIGO, 'NO');
                    }
                    /* Pregunta 3 */
                    if (pregunta3.includes('si')) {
                        await updateQuestion(10, pacientes[i].TURNCODIGO, 'SI');
                    } else if (pregunta3.includes('no')) {
                        await updateQuestion(10, pacientes[i].TURNCODIGO, 'NO');
                    }
                    /* Pregunta 1 */
                    pacientes[i].RESPONDIO = "SI";
                    const pacientesJSON = JSON.stringify(pacientes);

                    fs.writeFileSync('dbPy.json', pacientesJSON, { encoding: 'utf8' });
                    endFlow( `📱 +${numero}\n¡Muchas gracias por compartir tu respuesta! 😊🙏`)
                    break;
                }
            }

        } catch (error) {
            console.error("Error al leer o escribir el archivo JSON:", error);
        }
    })