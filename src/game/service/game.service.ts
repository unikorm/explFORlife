import { Controller } from "../Controller";

export class GameConnection {
    private peerConnnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private ws: WebSocket;
    private remoteController: Controller | null = null;

    constructor(existingController: Controller) {
        this.remoteController = existingController;
        // connect to our signaling server
        this.ws = new WebSocket('ws://localhost:8080');

        // create the RTCPeerConnection with STUN server configuration
        this.peerConnnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        })

        this.setupWebSocket();
        this.setupPeerConnection();
    }

    private setupWebSocket = () => {
        // when we first connect to the signaling server
        this.ws.onopen = () => {
            // tell the server "I'm the game"
            this.ws.send(JSON.stringify({ type: 'register', role: 'game' }))

            // start the connection process
            this.createOffer();
        }
    }

    private setupPeerConnection = () => {
        // create a channel specifically for control data
        this.dataChannel = this.peerConnnection.createDataChannel('controls');

        // what to do when we receive control messages
        this.dataChannel.onmessage = (event) => {
            // parse the incoming control data
            const controlData: string[] = JSON.parse(event.data);

            // update the existing controller's state
            if (this.remoteController) {
                this.remoteController.updateFromRemote(controlData);
            }
        }

        // handle new connection paths as we discover them
        this.peerConnnection.onicecandidate = (event) => {
            if (event.candidate) {
                // send any new connection paths to the controller
                this.ws.send(JSON.stringify({ type: 'ice-candidate', target: 'controller', candidate: event.candidate }));

            }
        }
    }

    private createOffer = async () => {
        // create the connection offer
        const offer = await this.peerConnnection.createOffer();

        // save it as our local description
        await this.peerConnnection.setLocalDescription(offer);

        // send the offer to the controller through the signaling server
        this.ws.send(JSON.stringify({ type: 'offer', target: 'controller', offer }));
    }
}