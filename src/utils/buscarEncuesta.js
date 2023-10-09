const fs = require('fs');

module.exports = async function buscarSiHizoEncuesta(ctx, { endFlow }) {
    try {
        const data = fs.readFileSync('dbPy.json', 'utf8');
        const pacientes = JSON.parse(data);
        let encontrado = false;

        // Recorrer el array al revés
        for (let i = pacientes.length - 1; i >= 0; i--) {
            // Encontrar el último registro
            if (pacientes[i].NUMERO === ctx.from) {
                // Verificar si se encontró al paciente
                if (pacientes[i].RESPONDIO == "SI") {
                    endFlow('¡Ya completo la encuesta! ¡Muchas gracias por su participación! 😊👍\n', pacientes[i].DOCUMENTO);
                }
                encontrado = true;
                break;
            }
        }
        if (!encontrado) {
            endFlow('Lamentablemente, usted no puede realizar la encuesta. 🙁👍');
        }

    } catch (error) {
        console.error("Error al leer o escribir el archivo JSON:", error);
    }
}