const mongoose = require("mongoose");

// Definindo o esquema do Operador
const vendasSchema = new mongoose.Schema({
  _id: String,
  operador: {
    id: String,
    nome: String,
  },
    produtos: [{
      _id: String,
      data: {
        type:Date,
        default:Date.now
      },
      descricao: String,
      marca: String,
      unidadeMedida: String,
      quantidade: Number,
      valorUnitario: Number,
    }],
});

const Vendas = mongoose.model("Vendas", vendasSchema);

module.exports = Vendas;
