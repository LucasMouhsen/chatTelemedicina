const { getAuthSheets } = require("./oAuth");

async function insertGoogleSheets(nuevoRegistro) {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  // Obtén los valores actuales en la hoja
  const response = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Hoja 1", // Reemplaza con el nombre de tu hoja
  });
  const values = response.data.values;

  // Convierte el nuevo registro en un arreglo de valores
  const nuevoRegistroValues = Object.values(nuevoRegistro);

  // Inserta el nuevo registro en la hoja al final
  values.push(nuevoRegistroValues);

  // Actualiza todos los registros en la hoja
  await googleSheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: "Hoja 1", // Reemplaza con el nombre de tu hoja
    valueInputOption: "RAW", // O el modo de entrada que prefieras
    resource: {
      values: values,
    },
  });
}

module.exports = { insertGoogleSheets };
