const mongoose = require("mongoose");

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

const produtos = new mongoose.Schema({
  _id: String,
  data: {
    type:Date,
    default:Date.now
  },
  nome: String,
  marca: String,
  unidadeMedida: String,
  quantidade: Number,
  valorUnitario: Number,
})


const Vendas = mongoose.model("Vendas", vendasSchema);
const Produtos = mongoose.model("Produtos", produtos)

module.exports = {Vendas,Produtos};
