const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const fs = require('fs');
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql');
const { updateQuestion } = require('./google/sheets');

async function leerPacientes() {
    try {
        const data = await fs.readFile('dbpy.json', 'utf8');
        const pacientes = JSON.parse(data);
        return pacientes;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

/**
 * Declaramos las conexiones de MySQL
 */

const MYSQL_DB_HOST = 'localhost'
const MYSQL_DB_USER = 'root'
const MYSQL_DB_PASSWORD = 'root'
const MYSQL_DB_NAME = 'bot'
const MYSQL_DB_PORT = '3306'

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
const siNo = ['si', 'no']


const flowTerciario = addKeyword(siNo)
    .addAnswer(
        [
            '3️⃣ ¿Recomendaría este tipo de atencion a otra persona?\n',
            '👉 Responder con SI o NO'
        ],
        { capture: true, delay: 2000 },
        async (ctx, { fallBack, flowDynamic }) => {
            const mensaje = ctx.body.toLowerCase()
            if (!siNo.some(item => mensaje.includes(item))) {
                return fallBack('No le entendi, 👉 Por favor responder con SI o NO')
            } else {
                fs.readFile('dbpy.json', 'utf8', (error, data) => {
                    const pacientes = JSON.parse(data);
                    if (error) {
                        console.error('Error al leer el archivo:', error);
                        return;
                    }
                    for (let i = pacientes.length - 1; i >= 0; i--) {
                        ctx.from == pacientes[i].NUMERO
                        if (ctx.from == pacientes[i].NUMERO) {
                            const bodyLowerCase = ctx.body.toLowerCase();
                            if (bodyLowerCase.includes('si')) {
                                updateQuestion(10, pacientes[i].TURNCODIGO, 'SI')
                            } else if (bodyLowerCase.includes('no')) {
                                updateQuestion(10, pacientes[i].TURNCODIGO, 'NO')

                            }
                            /* updateQuestion(12, pacientes[i].TURNCODIGO, ctx.body)   */
                            flowDynamic('Gracias por responder a la encuesta!')
                        }
                    }
                })

            }
            return flowDynamic('Gracias por responder a la encuesta!')
        }
    )

const flowSecundario = addKeyword(numbers)
    .addAnswer(
        [
            '2️⃣ ¿La consulta realizada, ayuda a resolver su problema?\n',
            '👉 Responder con SI o NO'
        ],
        { capture: true, delay: 2000 },
        (ctx, { fallBack, flowDynamic }) => {

            const mensaje = ctx.body.toLowerCase()
            if (!siNo.some(item => mensaje.includes(item))) {
                return fallBack('No le entendi, 👉 Por favor responder con SI o NO')
            }
            else {
                fs.readFile('dbpy.json', 'utf8', (error, data) => {
                    const pacientes = JSON.parse(data);
                    if (error) {
                        console.error('Error al leer el archivo:', error);
                        return;
                    }
                    for (let i = pacientes.length - 1; i >= 0; i--) {
                        ctx.from == pacientes[i].NUMERO
                        if (ctx.from == pacientes[i].NUMERO) {
                            const bodyLowerCase = ctx.body.toLowerCase();
                            if (bodyLowerCase.includes('si')) {
                                updateQuestion(9, pacientes[i].TURNCODIGO, 'SI')
                            } else if (bodyLowerCase.includes('no')) {
                                updateQuestion(9, pacientes[i].TURNCODIGO, 'NO')

                            }
                            /* updateQuestion(12, pacientes[i].TURNCODIGO, ctx.body)   */
                            flowDynamic('Siguiente pregunta!')
                        }
                    }
                })

            }
        },
        [flowTerciario]
    )

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer(
        [
            '1️⃣ ¿Cuál es su nivel de satisfaccion con la atención profesional recibida?\n',
            '👉 Responder del 1 al 10'
        ],
        {capture: true},
        (ctx, { fallBack, flowDynamic }) => {
            if (!numbers.some(item => ctx.body.includes(item))) {
                return fallBack('No le entendi, 👉 Por favor responder del 1 al 10')
            }
            else {
                fs.readFile('dbpy.json', 'utf8', (error, data) => {
                    const pacientes = JSON.parse(data);
                    if (error) {
                        console.error('Error al leer el archivo:', error);
                        return;
                    }
                    for (let i = pacientes.length - 1; i >= 0; i--) {
                        if (ctx.from == pacientes[i].NUMERO) {
                            const number = ctx.body.replace(/[^0-9]/g, ''); 
                            updateQuestion(8, pacientes[i].TURNCODIGO, number);
                            /* updateQuestion(11, pacientes[i].TURNCODIGO, ctx.body); */
                            flowDynamic('Siguiente pregunta!')
                        }
                    }
                })

            }
        },
        [flowSecundario]
    )
const flowFlow = addKeyword


const main = async () => {
    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()