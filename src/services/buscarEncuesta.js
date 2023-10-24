const fs = require('fs');
const { searchSheet } = require('../middleware/google/searchSheet');

module.exports = async function buscarSiHizoEncuesta(ctx, { endFlow }) {
    try {
        let encontrado = false;
        let pacienteIndex

        const values = await searchSheet()
        // Recorrer el array al revés
        for (let i = values.length - 1; i >= 0; i--) {
            // Encontrar el último registro
            if (values[i].CONTACTO === ctx.from) {
                // Verificar si se encontró al paciente
                if (values[i].RESPONDIO == "SI") {
                    await endFlow(`📱 +${ctx.from}\n\n¡Ya completo la encuesta! ¡Muchas gracias por su participación! 😊👍`);
                    pacienteIndex = i
                } else {
                    pacienteIndex = i
                }
                encontrado = true;
                break;
            }
        }
        if (!encontrado) {
            await endFlow(`📱 +${ctx.from}\n\nLamentablemente, usted no puede realizar la encuesta. 🙁👍`);
        }
        return values[pacienteIndex]

    } catch (error) {
        console.error("Error al leer o escribir el archivo JSON:", error);
    }
}