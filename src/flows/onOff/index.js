const { addKeyword } = require('@bot-whatsapp/bot');
const { esperar } = require('../../utils/sleep');
const { searchDb } = require('../../utils/dbSend')
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const { insertGoogleSheets } = require('../../middleware/google/insert');

module.exports = addKeyword(['onsherlock', 'offsherlock'])
    .addAction(async (ctx, { globalState, provider }) => {
        await esperar(1, 2);
        await provider.sendText(`5491131890767@c.us`, `${ctx.from}\n\nEncendiendo`);
        const newPacientes = []
        const pacientes = await searchDb()
        await esperar(1, 2);

        for (const paciente of pacientes) {
            const mensaje = `Hola ${paciente.name},\n\nNos contactamos de la Secretaria de Salud de la Municipalidad de San Miguel, usted tuvo un turno para ${paciente.procedimiento}, el día ${paciente.fechaTurno}.\n\nNos gustaría saber más sobre tu experiencia para mejorar nuestros servicios. Por favor, tómate un momento para responder a esta breve encuesta. Para comenzar, escribe alguna de las siguientes palabras:\n\n👋 Hola\n📋 Encuesta\n\nEs importante contar con tu respuesta.\nMuchas gracias.`
            await provider.sendText(`${paciente.numero}@c.us`, mensaje);
            const newPaciente = {
                NOMBRE: paciente.name,
                TURNCODIGO: paciente.turnCodigo,
                DOCUMENTO: paciente.documento,
                FECHATURNO: paciente.fechaTurno,
                NUMERO: paciente.numero,
                PROCEDIMIENTO: paciente.procedimiento,
                FECHAENVIO: new Date(),
                UBICACION: paciente.ubicacion,
                RESPONDIO: ''
            }
            newPacientes.push(newPaciente)
            await insertGoogleSheets(newPaciente)
            await esperar(1, 2);
        };
        await esperar(1, 2);

        // Leer el archivo JSON existente
        const data = await fs.readFileSync('dbPy.json', 'utf8');
        const pacientesJson = JSON.parse(data);

        // Agregar los nuevos pacientes al objeto pacientesJson
        pacientesJson.push(...newPacientes);

        // Escribir el objeto actualizado en el archivo JSON
        await writeFile('dbPy.json', JSON.stringify(pacientesJson, null, 2), 'utf8');

        await provider.sendText(`5491131890767@c.us`, `${ctx.from}\n\nTermine`);
    })