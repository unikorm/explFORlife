import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 8080,
    host: '0.0.0.0'
});

const connections = new Map();

wss.on("connection", (ws, request) => {
    const clientIP = request.socket.remoteAddress;
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        switch (data.type) {
            case 'register':
                connections.set(data.role, ws);
                break;

            case 'offer':
            case 'answer':
            case 'ice-candidate':
                const target = data.target === 'game' ?
                    connections.get('game') : connections.get('controller');

                if (target) target.send(JSON.stringify(data));
                break;

        }
    });

    ws.on("close", () => {
        console.log(`Client disconnected: ${clientIP}`);
        connections.forEach((value, key) => {
            if (value === ws) connections.delete(key);
        });
        console.log('Remaining connections:', Array.from(connections.keys()));
    });
});

wss.on('listening', () => {
    console.log(`WebSocket server is listening on port ${wss.options.port}`);
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});