const { addKeyword } = require('@bot-whatsapp/bot');
const { esperar } = require('../../utils/sleep');
const { searchDb } = require('../../services/dbSend')
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const { insertGoogleSheets } = require('../../middleware/google/insert');

module.exports = addKeyword(['onsherlock', 'offsherlock'])
    .addAction(async (ctx, { globalState, provider }) => {
        await esperar(5, 10);
        await provider.sendText(`5491131890767@c.us`, `${ctx.from}\n\nEncendiendo`);
        const pacientes = await searchDb()
        await esperar(5, 10);

        for (const paciente of pacientes) {
            const mensaje = `Hola ${paciente.name},\n\nNos contactamos de la Secretaria de Salud de la Municipalidad de San Miguel, usted tuvo un turno para ${paciente.procedimiento}, el día ${paciente.fechaTurno}.\n\nNos gustaría saber más sobre tu experiencia para mejorar nuestros servicios. Por favor, tómate un momento para responder a esta breve encuesta. Para comenzar, escribe alguna de las siguientes palabras:\n\n👋 Hola\n📋 Encuesta\n\nEs importante contar con tu respuesta.\nMuchas gracias.`
            await provider.sendText(`${'5491131890767'}@c.us`, mensaje);
            const newPaciente = {
                NOMBRE: paciente.name,
                TURNCODIGO: paciente.turnCodigo,
                DOCUMENTO: paciente.documento,
                FECHATURNO: paciente.fechaTurno,
                NUMERO: paciente.numero,
                PROCEDIMIENTO: paciente.procedimiento,
                FECHAENVIO: new Date(),
                UBICACION: paciente.ubicacion,
                RESPONDIO: 'NO'
            }
            await insertGoogleSheets(newPaciente)
            await esperar(30, 45);
        };
        await esperar(2, 3);
        await provider.sendText(`5491131890767@c.us`, `${ctx.from}\n\nTermine`);
    })