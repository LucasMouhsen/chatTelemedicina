const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const fs = require('fs');
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')

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
        { capture: true },
        (ctx, { fallBack, flowDynamic }) => {
            const mensaje = ctx.body.toLowerCase()
            if (!siNo.some(item => mensaje.includes(item))) {
                return fallBack('No le entendi, 👉 Responder con SI o NO')
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
        { capture: true },
        (ctx, { fallBack, flowDynamic }) => {

            const mensaje = ctx.body.toLowerCase()
            if (!siNo.some(item => mensaje.includes(item))) {
                return fallBack('No le entendi, 👉 Responder con SI o NO')
            }
        },
        [flowTerciario]
    )

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    /* .addAction(async (ctx, { flowDynamic }) => {
        const  pacientes  = await leerPacientes()
        console.log(pacientes);
        pacientes.forEach(paciente => {
            if (paciente.numero == ctx.from) {
                flowDynamic('hay match')
            }
        });
    }) */
    .addAnswer(
        [
            '1️⃣ ¿Cuál es su nivel de satisfaccion con la atención profesional recibida?\n',
            '👉 Responder del 1 al 10'
        ],
        { capture: true },
        (ctx, { fallBack, flowDynamic }) => {
            if (!numbers.some(item => ctx.body.includes(item))) {
                return fallBack('No le entendi, 👉 Responder del 1 al 10')
            }
        },
        [flowSecundario]
    )



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