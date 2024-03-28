const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const { randomUUID } = require("crypto");
const {Vendas,Produtos} = require("./models");
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
app.post("/vendas/", async (request, response) => {
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
//Rota que registra produto
app.post("/produtos/", async (request,response) =>{
  try {
    const {nome,marca,unidadeMedida,quantidade,valorUnitario} = request.body

    const produtos = new Produtos({
      _id: randomUUID(),
      data: Date.now(),
      nome,
      marca,
      unidadeMedida,
      quantidade,
      valorUnitario,  
    })
    await produtos.save()
    return response.status(201).json({ message: "Produto salvo com sucesso" })
  } catch (error) {
    return response.status(500).json({ error: "Erro ao salvar pedido" });
  }
})

//Rota que lista todos os produtos 
app.get("/produtos/", async (request, response) => {
  try {
    const products = await Produtos.find();
    response.json(products);
  } catch (error) {
    console.log("Erro ao buscar Dados");
  }
});

// Rota que retorna Todos os registros de Vendas
app.get("/vendas/", async (request, response) => {
  try {
    const order = await Vendas.find();
    response.json(order);
  } catch (error) {
    console.log("Erro ao buscar Dados");
  }
});


// Rota que busca venda específica
app.get("/vendas/:id", async (request, response) => {
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
// Buscar por produto especifico em uma venda
app.get("/vendas/produtos/:id", async (request, response) => {
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
app.patch("/vendas/operador/:id", async (request, response) => {
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
//Rota para alteração no cadastro do produto
app.patch("/produtos/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const {nome,marca,unidadeMedida,quantidade,valorUnitario} = request.body;

    const product = await Produtos.findById(id);
    if (!product) {
      return response.status(404).json({ error: "Produto não encontrado" });
    }
    product.nome = nome || product.nome
    product.marca = marca || product.marca
    product.unidadeMedida = unidadeMedida || product.unidadeMedida
    product.quantidade = quantidade || product.quantidade
    product.valorUnitario = valorUnitario || product.valorUnitario

    await product.save();
    return response.json(product);
  } catch (error) {
    console.error("Erro ao atualizar Produto:", error);
    return response.status(500).json({ error: "Erro ao atualizar Produto" });
  }
});
// Rota que altera dados sobre produtos registrados em vendas
app.patch("/vendas/produtos/:id", async (request, response) => {

  try {
    const { id } = request.params;
    const updates = request.body;

    const order = await Vendas.findOne({ "produtos._id": id });
    console.log(order)

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
// Rota para apagar produtos
app.delete("/produtos/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const product = await Produtos.findById(id);
    if (!product) {
      return response.status(404).json({ error: "Produto não Encontrado!!" });
    }
    await product.deleteOne();
    return response.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir Produto:", error);
    return response.status(500).json({ error: "Erro ao excluir Produto" });
  }
});

//Rota que Deleta todo o Registro de Vendas
app.delete("/vendas/:id", async (request, response) => {
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
