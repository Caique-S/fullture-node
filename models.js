const mongoose = require('mongoose');

// Definindo o esquema do Operador
const operadorSchema = new mongoose.Schema({
  _id: String,
  operador: {
    id: String,
    nome: String,
    produtos: [String]
  }
});

const Operador = mongoose.model('Operador', operadorSchema);

module.exports = Operador;
