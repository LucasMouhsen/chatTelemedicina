const { addKeyword } = require('@bot-whatsapp/bot');
const { updateQuestion } = require('../../middleware/google/sheets');
const fs = require('fs');
const { esperar } = require('../../utils/sleep');
const buscarEncuesta = require('../../utils/buscarEncuesta');

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const siNo = ['si', 'no'];
const validacion = ['hola', 'encuesta']



module.exports = addKeyword(validacion)
    .addAction(async (ctx, { endFlow }) => {
        buscarEncuesta(ctx, { endFlow })
        await esperar(1,2)
    })
    .addAnswer(
        [
            '1️⃣ ¿Cuál es su nivel de satisfacción con la atención profesional recibida?\n',
            '👉 Responder del 1 al 10'
        ],
        { capture: true },
        async (ctx, { fallBack, state }) => {
            if (!numbers.some(item => ctx.body.includes(item))) {
                await esperar(1,2)
                return fallBack();
            } else {
                state.update({quest1: ctx.body})
                await esperar(1,2)
            }
        }
    )
    .addAnswer(
        [
            '2️⃣ ¿La consulta realizada ayuda a resolver su problema?\n',
            '👉 Responder con SI o NO'
        ],
        { capture: true },
        async (ctx, { fallBack, state }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                await esperar(1,2)
                return fallBack('No le entendí, 👉 Por favor responder con SI o NO');
            } else {
                state.update({quest2: ctx.body})
                await esperar(1,2)
            }
        }
    )
    .addAnswer(
        [
            '3️⃣ ¿Recomendaría este tipo de atención a otra persona?\n',
            '👉 Responder con SI o NO'
        ],
        { capture: true },
        async (ctx, { fallBack, state }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                await esperar(1,2)
                return fallBack('No le entendí, 👉 Por favor responder con SI o NO');
            } else {
                state.update({quest3: ctx.body})
                await esperar(1,2)
            }
        }
    )
    .addAnswer('¡Muchas gracias por compartir tu respuesta! 😊🙏')
    .addAction(async (ctx,{state}) => {
        const myState = state.getMyState()
        console.log(myState);
        console.log(myState.quest1);
        try {
            const data = fs.readFileSync('dbPy.json', 'utf8');
            const pacientes = JSON.parse(data);

            // Recorrer el array al revés
            for (let i = pacientes.length - 1; i >= 0; i--) {
                // Encontrar el último registro
                if (pacientes[i].NUMERO === ctx.from) {
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

                    break;
                }
            }

        } catch (error) {
            console.error("Error al leer o escribir el archivo JSON:", error);
        }
    })

/* module.exports = [flowPrincipal] */