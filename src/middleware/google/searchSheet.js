const { getAuthSheets } = require("./oAuth");

async function searchSheet() {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  // Obtén los valores actuales en la hoja
  const response = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Hoja 1",
  });
  const data = response.data.values;
  
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = {
      NOMBRE: data[i][0],
      TURNCODIGO: data[i][1],
      DOCUMENTO: data[i][2],
      FECHATURNO: data[i][3],
      CONTACTO: data[i][4],
      PROCEDIMIENTO: data[i][5],
      FECHAENVIO: data[i][6],
      UBICACION: data[i][7],
      RESPONDIO: data[i][8]
    }
    result.push(row);
  }
  
  return result
}

module.exports = { searchSheet };
