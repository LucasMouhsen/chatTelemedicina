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
        await provider.sendText(`5491131890767@c.us`, 'Encendiendo');
        const newPacientes = []
        if (true) {
            const pacientes = await searchDb()
            await esperar(1, 2);
            for (const paciente of pacientes) {
                await provider.sendText(`5491131890767@c.us`, `Buenas tardes ${paciente.name}(Este nombre viene de la base) esta es una prueba de teleasistencia, pero para los panas es telemedicina. saludos!`);
                const newPaciente = {
                    NOMBRE: paciente.name,
                    TURNCODIGO: paciente.turnCodigo,
                    DOCUMENTO: paciente.documento,
                    FECHATURNO: paciente.fechaTurno,
                    NUMERO: paciente.numero,
                    PROCEDIMIENTO: paciente.procedimiento,
                    FECHAENVIO: '',
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

            await provider.sendText(`5491131890767@c.us`, 'Ya terminé');
        }
    })