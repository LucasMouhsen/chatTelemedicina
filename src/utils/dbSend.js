require("dotenv").config();
const sql = require("mssql");
const parceNum = require("./parceNum");
const capitalizeOneLetter = require("./capitalizeOneLetter");
const formatDate = require("./formatDate");


const sqlConfig = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER,
  database: process.env.DATABASE,
  port: +process.env.PORT,
  options: {
    trustServerCertificate: true,
  },
};

// Configuración de la base de datos

async function searchDb() {
  const pool = await sql.connect(sqlConfig);
  try {
    // Consulta a la base de datos
    const consulta = process.env.SQL_QUERY;
    const result = await sql.query(consulta);

    // Crear paciente con la base de datos
    const pacientes = [];
    for (const row of result.recordset) {
      const nombre = capitalizeOneLetter(row.paci_Paciente.trim());
      const turnCodigo = row.turn_Codigo
      const documento = row.pers_NumeroDocumento
      const fechaTurno = formatDate(row.turn_FechaTurno)
      const numero = parceNum(row.tele_Numero)
      const procedimiento = capitalizeOneLetter(row.nome_Descripcion.trim())
      const ubicacion = capitalizeOneLetter(row.ubic_Descripcion.trim())
      const mediMedico = capitalizeOneLetter(row.medi_Medico.trim());
      pacientes.push({
        name: nombre,
        turnCodigo: turnCodigo,
        fechaTurno: fechaTurno,
        documento: documento,
        procedimiento: procedimiento,
        numero: numero,
        ubicacion: ubicacion,
        mediMedico: mediMedico,
      });
    }
    // Cerrar la conexión con la base de datos
    await pool.close();
    //Retornar paciente
    return pacientes;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { searchDb };
