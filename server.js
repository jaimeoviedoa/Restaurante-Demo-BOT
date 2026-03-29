import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔐 VERIFY TOKEN
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

      let responseText = "";

      if (text) {
        const lowerText = text.toLowerCase();

        // 👋 SALUDO
        if (lowerText === "hola" || lowerText.includes("hola")) {
          responseText = `👋 Bienvenido a *PB Restaurant*

¿Qué deseas hacer?

1️⃣ Ver menú  
2️⃣ Hacer pedido  
3️⃣ Hablar con humano`;
        }

        // 📋 VER MENÚ
        else if (lowerText === "1" || lowerText.includes("menu")) {
          responseText = `🍕 *MENÚ*

1️⃣ Pizza - 10€  
2️⃣ Hamburguesa - 8€  
3️⃣ Pasta - 9€

Responde con el número del producto`;
        }

        // 🍕 SELECCIÓN DE PRODUCTO
        else if (lowerText === "1") {
          responseText = `🍕 Has elegido *Pizza*

¿Cuántas deseas?`;
        }

        else if (lowerText === "2") {
          responseText = `🍔 Has elegido *Hamburguesa*

¿Cuántas deseas?`;
        }

        else if (lowerText === "3") {
          responseText = `🍝 Has elegido *Pasta*

¿Cuántas deseas?`;
        }

        // 🛒 HACER PEDIDO (placeholder)
        else if (lowerText.includes("pedido")) {
          responseText = `🛒 Para hacer un pedido:

1️⃣ Ver menú  
2️⃣ Elegir producto  

Empieza escribiendo *1*`;
        }

        // 👤 HUMANO
        else if (lowerText === "3" || lowerText.includes("humano")) {
          responseText = `👤 Te contactaremos con un humano en breve`;
        }

        // ❓ DEFAULT
        else {
          responseText = `😅 No entendí tu mensaje

Escribe *hola* para comenzar`;
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