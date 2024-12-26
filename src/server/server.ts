import { WebSocketServer } from "ws";

// creating actual server, configurate to accept connections from any IP address
const wss = new WebSocketServer({
    port: 8000,
    host: '0.0.0.0'
});

// our local store of connections (game and controller)
const connections = new Map();

// on listening event, log that server is running
wss.on('listening', () => {
    console.log(`\n(server.ts)\nWebSocket server is listening on port ${wss.options.port}`);
});

// on connection event, new client connected (every client has own ws object)
wss.on("connection", (ws, request) => {

    const clientIP = request.socket.remoteAddress;
    console.log(`\n(server.ts)\nNew client connected: ${clientIP}`);

    // on message event, client send message
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        console.log('\n(server.ts)\nReceived message:');
        console.log('Type:', data.type);
        console.log('Content:', data);

        switch (data.type) {
            case 'register':
                // register as game or controller
                connections.set(data.role, ws);
                console.log(`Registered as ${data.role}`);
                break;

            // these are WebRTC related types of messages that need to be forwarded to the other peer for creating a connection
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                const target = data.target === 'game' ?
                    connections.get('game') : connections.get('controller');

                if (target) target.send(JSON.stringify(data));
                break;

        }
    })

    // on error event, log error
    wss.on('error', (error) => {
        console.error('\n(server.ts)\nWebSocket server error:', error);
    });

    // on close event, client disconnected
    ws.on("close", () => {
        console.log(`\nClient disconnected: ${clientIP}`);
        connections.forEach((value, key) => {
            if (value === ws) connections.delete(key);
        })
        console.log('Remaining connections:', Array.from(connections.keys()));
    })
})