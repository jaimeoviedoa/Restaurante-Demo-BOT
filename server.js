const express = require("express");
const app = express();

app.use(express.json());

// TOKEN QUE TU DEFINES
const VERIFY_TOKEN = "lumo_token";

// VERIFICACION (Meta llama aqui primero)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFICADO");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// RECIBIR MENSAJES
app.post("/webhook", (req, res) => {
  console.log("MENSAJE RECIBIDO:");
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
