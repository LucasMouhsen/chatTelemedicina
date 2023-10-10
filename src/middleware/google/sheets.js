const { getAuthSheets } = require("./oAuth");

async function updateQuestion( ubication ,codeToSearch, newCancelValue) {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  // Obtener los valores actuales en la hoja
  const response = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Hoja 1",
  });
  const values = response.data.values;

  // Recorrer todos los registros y actualizar celda "CANCELAR" si el código coincide
  for (let i = values.length - 1; i >= 0; i--) { // Comenzar en 1 para omitir la fila de encabezados
    if (+values[i][1] === +codeToSearch) { // Comprobar el código en la columna "NÚMERO DE CONTACTO"
      values[i][ubication] = newCancelValue; // Actualizar celda "pregunta1" (índice 9)
      break;
    }
  }

  // Actualizar todos los registros modificados en la hoja
  await googleSheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: "Hoja 1",
    valueInputOption: "RAW", // O el modo de entrada que prefieras
    resource: {
      values: values,
    },
  });
}





module.exports = { updateQuestion }


