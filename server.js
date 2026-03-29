import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔐 VERIFY TOKEN (puedes cambiarlo si quieres)
const VERIFY_TOKEN = "lumo_token";

// 👉 GET webhook (verificación Meta)
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

// 👉 POST webhook (recibir mensajes)
app.post("/webhook", async (req, res) => {
  console.log("MENSAJE RECIBIDO:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const from = message.from;
      const text = message.text?.body;

      console.log("Usuario dice:", text);

      // 💬 RESPUESTA AUTOMÁTICA SIMPLE
      let responseText = "No entendí tu mensaje 🤔";

      if (text) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes("hola")) {
          responseText = "Hola 👋 soy *PB bot 1.0* 🤖\n\nBienvenido a nuestro restaurante 🍽️\n\n¿Quieres ver el menú o hacer una reserva?";
        } else if (lowerText.includes("menu")) {
          responseText = "🍽️ *MENÚ*\n\n- Pizza 🍕\n- Pasta 🍝\n- Hamburguesa 🍔\n\nEscribe *pedido* para ordenar";
        } else if (lowerText.includes("reserva")) {
          responseText = "📅 Para reservas indícanos:\n\n- Día\n- Hora\n- Número de personas";
        } else if (lowerText.includes("pedido")) {
          responseText = "🛒 ¿Qué deseas pedir?\n\nEjemplo: 'Quiero una pizza'";
        } else {
          responseText = `👀 Recibí: "${text}"\n\nEscribe *menu* para ver opciones`;
        }
      }

      // 📤 Enviar mensaje
      await fetch(`https://graph.facebook.com/v18.0/${value.metadata.phone_number_id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: {
            body: responseText
          }
        })
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("ERROR:", error);
    res.sendStatus(500);
  }
});

// 🚀 servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});