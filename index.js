const express = require('express')
const app = express()

const PORT = 3030

app.get('/',(request,response) => {
    response.send("Olá Mundo")
})
app.post('/',(request,response) => {
    response.send("Olá Mundo")
})
app.put('/',(request,response) => {
    response.send("Olá Mundo")
})
app.delete('/',(request,response) => {
    response.send("Olá Mundo")
})

app.listen(PORT, () => {console.log("Servidor online. Porta: " + PORT)})