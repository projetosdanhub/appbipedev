import WebSocket from "ws";

async function run() {
  // Test local nginx /ws
  console.log("Testing wss://localhost:3443/ws ...");
  const wsLocal = new WebSocket("wss://localhost:3443/ws", {
    rejectUnauthorized: false,
    headers: {
      Host: "app.localhost"
    }
  });

  wsLocal.on("open", () => {
    console.log("wsLocal connected!");
  });

  wsLocal.on("message", (data) => {
    console.log("wsLocal message:", data.toString());
  });

  wsLocal.on("error", (err) => {
    console.error("wsLocal error:", err.message);
  });

  wsLocal.on("close", (code, reason) => {
    console.log("wsLocal closed:", code, reason.toString());
  });

  // Test ngrok /ws
  console.log("Testing wss://average-applied-subfloor.ngrok-free.dev/ws ...");
  const wsNgrok = new WebSocket("wss://average-applied-subfloor.ngrok-free.dev/ws");

  wsNgrok.on("open", () => {
    console.log("wsNgrok connected!");
  });

  wsNgrok.on("message", (data) => {
    console.log("wsNgrok message:", data.toString());
  });

  wsNgrok.on("error", (err) => {
    console.error("wsNgrok error:", err.message);
  });

  wsNgrok.on("close", (code, reason) => {
    console.log("wsNgrok closed:", code, reason.toString());
  });

  setTimeout(() => {
    wsLocal.close();
    wsNgrok.close();
    process.exit(0);
  }, 4000);
}

run();
