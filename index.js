const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const fs = require("fs");
const { randomUUID } = require("crypto");
const Operador = require("./models");
const { hostname } = require("os");
const app = express();
app.use(express.json());

const PORT = 3030;
const HOST = "0.0.0.0"
const mongoUrl = process.env.MONGODB_URL
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Conecxão Estabelecida"))
  .catch(() => {console.error("Conexão não estabelecida");
});
// Rota que registra Vendas
app.post("/", async (request, response) => {
  const { id, nome, produtos } = request.body;
  try {
    const _id_ = randomUUID();
    const order = new Operador({
      _id: _id_,
      operador: {
        id,
        nome,
        produtos,
      },
    });
    await order.save();
    fs.writeFile("vendas.json", JSON.stringify(order), (err) => {
      if (err) {
        console.log(err);
        return response
          .status(500)
          .json({ error: "Erro ao inserir produto na Base de Dados local" });
      } else {
        console.log("Produto inserido em Base de Dados local.");
        response.send(order);
      }
    });
  } catch (error) {
    console.log("Deu erro !!!", error);
    return response.status(500).json({ error: "Erro ao salvar pedido" });
  }
});
// Rota que retorna Todos os registros de Vendas
app.get("/", async (request, response) => {
  try {
    const order = await Operador.find();
    response.json(order);
  } catch (error) {
    console.log("Erro ao buscar Dados");
  }
});
// Rota que busca venda específica
app.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const order = await Operador.findById(id);
    if (!order) {
      return response.status(404).json({ error: "Registro não Encontrado" });
    }
    return response.json(order);
  } catch (error) {
    console.error("Erro ao buscar Dados:", error);
    return response.status(500).json({ error: "Erro ao buscar Dados" });
  }
});
//Rota que altera cada campo da venda Separadamente
app.patch("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const { id:bodyId , nome, produtos } = request.body;

    const order = await Operador.findById(id);
    if (!order) {
      return response.status(404).json({ error: "Registro não encontrado" });
    }
    order.operador.id = bodyId || order.operador.id;
    order.operador.nome = nome || order.operador.nome;
    order.operador.produtos = produtos || order.operador.produtos ;

    await order.save();
    return response.json(order)
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
    return response.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

app.delete("/:id", async (request, response) => {
  try {
    const {id} = request.params
    const order = await Operador.findById(id)
    if(!order){
      return response.status(404).json({ error: "Regitro não Encontrado!!" });
    }
    await order.deleteOne()
    return response.json({ message: "Registro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir registro:", error);
    return response.status(500).json({ error: "Erro ao excluir registro" });
  }
});

app.listen(process.env.PORT || PORT,HOST, () => {
  console.log("Servidor online.");
});
