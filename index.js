const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const { randomUUID } = require("crypto");
const Vendas = require("./models");
const app = express();
app.use(express.json());

const PORT = 3030;
const HOST = "0.0.0.0";
const mongoUrl = process.env.MONGODB_URL;
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Conecxão Estabelecida"))
  .catch(() => {
    console.error("Conexão não estabelecida");
  });
// Rota que registra Vendas
app.post("/", async (request, response) => {
  const {id,nome,produtos,} = request.body;
  try {
    const _id_ = randomUUID();
    const dataCriacao = Date.now();

    const order = new Vendas({
      _id: _id_,
      operador: {
        id,
        nome,
      },
      produtos: produtos.map((produto) => ({
        _id: randomUUID(),
        data: dataCriacao,
        descricao: produto.descricao,
        marca: produto.marca,
        unidadeMedida: produto.unidadeMedida,
        quantidade: produto.quantidade,
        valorUnitario: produto.valorUnitario,
      })),
    });
    await order.save();
    return response.status(201).json({ message: "Pedido salvo com sucesso" });
  } catch (error) {
    return response.status(500).json({ error: "Erro ao salvar pedido" });
  }
});
// Rota que retorna Todos os registros de Vendas
app.get("/", async (request, response) => {
  try {
    const order = await Vendas.find();
    response.json(order);
  } catch (error) {
    console.log("Erro ao buscar Dados");
  }
});
// Rota que busca venda específica
app.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const order = await Vendas.find({ _id: id });
    if (!order) {
      return response.status(404).json({ error: "Registro não Encontrado" });
    }
    return response.json(order);
  } catch (error) {
    console.error("Erro ao buscar Dados:", error);
    return response.status(500).json({ error: "Erro ao buscar Dados" });
  }
});
// Buscar por produto especifico
app.get("/products/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const order = await Vendas.findOne(
      { "produtos._id": id },
      { "produtos.$": 1 }
    );
    if (!order) {
      return response.status(404).json({ error: "Registro não Encontrado" });
    }
    const product = order.produtos[0];
    return response.json(product);
  } catch (error) {
    console.error("Erro ao buscar Dados:", error);
    return response.status(500).json({ error: "Erro ao buscar Dados" });
  }
});
//Rota que altera dados sobre o operador especifico
app.patch("/operator/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const {id: bodyId,nome,} = request.body;

    const order = await Vendas.findById(id);
    if (!order) {
      return response.status(404).json({ error: "Registro não encontrado" });
    }
    order.operador.id = bodyId || order.operador.id;
    order.operador.nome = nome || order.operador.nome;

    await order.save();
    return response.json(order);
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
    return response.status(500).json({ error: "Erro ao atualizar registro" });
  }
});
// Rota que altera dados sobre algum produto especifico
app.patch("/products/:id", async (request, response) => {

  try {
    const { id } = request.params;
    const updates = request.body;

    const order = await Vendas.findOne({ "produtos._id": id });

    if (!order) {
      return response.status(404).json({ error: "Produto não encontrado" });
    }

    order.produtos = order.produtos.map(produto => {
      if (produto._id === id) {
        for (const campo in updates) {
          if (updates[campo] !== undefined) {
            produto[campo] = updates[campo];
          }
        }
      }
      return produto;
    });

    await order.save();
    const updatedProduct = order.produtos.find(produto => produto._id === id);
    return response.json(updatedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return response.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

//Rota que Deleta todo o Registro de Vendas
app.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const order = await Vendas.findById(id);
    if (!order) {
      return response.status(404).json({ error: "Regitro não Encontrado!!" });
    }
    await order.deleteOne();
    return response.json({ message: "Registro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir registro:", error);
    return response.status(500).json({ error: "Erro ao excluir registro" });
  }
});

app.listen(PORT || process.env.PORT, HOST, () => {
  console.log("Servidor online.");
});
