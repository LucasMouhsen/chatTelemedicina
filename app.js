const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const fs = require('fs');
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const JsonFileAdapter = require('@bot-whatsapp/database/json');
const { updateQuestion } = require('./google/sheets');

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const siNo = ['si', 'no'];
const validacion = ['hola', 'encuesta']

const welcome = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { endFlow }) => {
        if (!validacion.some(item => ctx.body.includes(item))) {
            return endFlow('Por favor para iniciar la encuesta responda con alguna de las siguientes opciones:\n▫️ Hola\n▫️ Encuesta');
        }
        else {
            return
        }
    })

const flowPrincipal = addKeyword(validacion)
    .addAction(async (ctx, { endFlow }) => {

        try {
            const data = fs.readFileSync('dbpy.json', 'utf8');
            const pacientes = JSON.parse(data);

            // Buscar el paciente por el número
            const pacienteIndex = pacientes.findIndex(paciente => paciente.NUMERO === ctx.from);
            console.log(pacienteIndex);
            // Verificar si se encontró al paciente
            if (pacienteIndex !== -1) {
                if (pacientes[pacienteIndex].RESPONDIO == "SI") {
                    endFlow('Usted ya respondio la encuesta.\nMuchas Gracias!')
                };

            } else {
                console.log("Paciente no encontrado");
            }
        } catch (error) {
            console.error("Error al leer o escribir el archivo JSON:", error);
        }
    })
    .addAnswer(
        [
            '1️⃣ ¿Cuál es su nivel de satisfacción con la atención profesional recibida?\n',
            '👉 Responder del 1 al 10'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic }) => {
            if (!numbers.some(item => ctx.body.includes(item))) {
                return fallBack('No le entendí, 👉 Por favor responder del 1 al 10');
            } else {
                try {
                    const data = fs.readFileSync('dbpy.json', 'utf8');
                    const pacientes = JSON.parse(data);
                    for (let i = pacientes.length - 1; i >= 0; i--) {
                        if (ctx.from === pacientes[i].NUMERO) {
                            const number = ctx.body.replace(/[^0-9]/g, '');
                            await updateQuestion(8, pacientes[i].TURNCODIGO, number);
                            // updateQuestion(11, pacientes[i].TURNCODIGO, ctx.body);
                            flowDynamic('¡Siguiente pregunta!');
                        }
                    }
                } catch (error) {
                    console.error('Error al leer el archivo:', error);
                }
            }
        }
    )
    .addAnswer(
        [
            '2️⃣ ¿La consulta realizada ayuda a resolver su problema?\n',
            '👉 Responder con SI o NO'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                return fallBack('No le entendí, 👉 Por favor responder con SI o NO');
            } else {
                try {
                    const data = fs.readFileSync('dbpy.json', 'utf8');
                    const pacientes = JSON.parse(data);
                    for (let i = pacientes.length - 1; i >= 0; i--) {
                        if (ctx.from === pacientes[i].NUMERO) {
                            const bodyLowerCase = ctx.body.toLowerCase();
                            if (bodyLowerCase.includes('si')) {
                                await updateQuestion(9, pacientes[i].TURNCODIGO, 'SI');
                            } else if (bodyLowerCase.includes('no')) {
                                await updateQuestion(9, pacientes[i].TURNCODIGO, 'NO');
                            }
                            // updateQuestion(12, pacientes[i].TURNCODIGO, ctx.body);
                            flowDynamic('¡Siguiente pregunta!');
                        }
                    }
                } catch (error) {
                    console.error('Error al leer el archivo:', error);
                }
            }
        }
    )
    .addAnswer(
        [
            '3️⃣ ¿Recomendaría este tipo de atención a otra persona?\n',
            '👉 Responder con SI o NO'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic }) => {
            const mensaje = ctx.body.toLowerCase();
            if (!siNo.some(item => mensaje.includes(item))) {
                return fallBack('No le entendí, 👉 Por favor responder con SI o NO');
            } else {
                try {
                    const data = fs.readFileSync('dbpy.json', 'utf8');
                    const pacientes = JSON.parse(data);
                    for (let i = pacientes.length - 1; i >= 0; i--) {
                        if (ctx.from === pacientes[i].NUMERO) {
                            const bodyLowerCase = ctx.body.toLowerCase();
                            if (bodyLowerCase.includes('si')) {
                                await updateQuestion(10, pacientes[i].TURNCODIGO, 'SI');
                            } else if (bodyLowerCase.includes('no')) {
                                await updateQuestion(10, pacientes[i].TURNCODIGO, 'NO');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al leer el archivo:', error);
                }
            }
        }
    )
    .addAnswer('Muchas gracias por su respuesta')
    .addAction(async (ctx) => {
        try {
            const data = fs.readFileSync('dbpy.json', 'utf8');
            const pacientes = JSON.parse(data);

            // Buscar el paciente por el número
            const pacienteIndex = pacientes.findIndex(paciente => paciente.NUMERO === ctx.from);
            console.log(pacienteIndex);

            // Verificar si se encontró al paciente
            if (pacienteIndex !== -1) {
                pacientes[pacienteIndex].RESPONDIO = "SI";
                const pacientesJSON = JSON.stringify(pacientes);

                fs.writeFileSync('dbpy.json', pacientesJSON, { encoding: 'utf8' });

            } else {
                console.log("Paciente no encontrado");
            }
        } catch (error) {
            console.error("Error al leer o escribir el archivo JSON:", error);
        }
    })

const main = async () => {
    const adapterDB = new JsonFileAdapter();
    const adapterFlow = createFlow([flowPrincipal, welcome]);
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
    );
    QRPortalWeb()
};

main();