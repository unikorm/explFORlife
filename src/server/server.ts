import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const connections = new Map();

wss.on("connection", (ws) => {
    console.log('New client connected');

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());

        switch (data.type) {
            case 'register':
                // register as game or controller
                connections.set(data.role, ws);
                console.log(`Registered ${data.role}`);
                break;

            case 'offer':
            case 'answer':
            case 'ice-candidate':
                // forward the message to the other peer
                const target = data.target === 'game' ?
                    connections.get('game') : connections.get('controller');

                if (target) target.send(JSON.stringify(data));
                break;

        }
    })

    ws.on("close", () => {
        // remove disconnected client
        connections.forEach((value, key) => {
            if (value === ws) connections.delete(key);
        })
    })
})