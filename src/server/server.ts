import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 8000,
    host: '0.0.0.0'
});
const connections = new Map();

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8000');
});

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

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });

    ws.on("close", () => {
        // remove disconnected client
        connections.forEach((value, key) => {
            if (value === ws) connections.delete(key);
        })
    })
})