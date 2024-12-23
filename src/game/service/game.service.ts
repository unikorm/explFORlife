import { ControlState } from "../../remote_controller/remote_controller";
import { Controller } from "../Controller";

export class GameConnection {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private ws: WebSocket;
    private remoteController: Controller | null = null;

    constructor(existingController: Controller) {
        this.remoteController = existingController;
        // connect to our signaling server
        this.ws = new WebSocket('ws://192.168.1.160:8080');

        // create the RTCPeerConnection with STUN server configuration
        this.peerConnection = new RTCPeerConnection({
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
        this.dataChannel = this.peerConnection.createDataChannel('controls');

        // what to do when we receive control messages
        this.dataChannel.onmessage = (event) => {
            // parse the incoming control data
            const controlData: ControlState = JSON.parse(event.data);

            // update the existing controller's state
            if (this.remoteController && controlData.type === 'controlUpdate') {
                this.remoteController.updateFromRemote(controlData.activeControls);
            }
        }

        // handle new connection paths as we discover them
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // send any new connection paths to the controller
                this.ws.send(JSON.stringify({ type: 'ice-candidate', target: 'controller', candidate: event.candidate }));

            }
        }
    }

    private createOffer = async () => {
        // create the connection offer
        const offer = await this.peerConnection.createOffer();

        // save it as our local description
        await this.peerConnection.setLocalDescription(offer);

        // send the offer to the controller through the signaling server
        this.ws.send(JSON.stringify({ type: 'offer', target: 'controller', offer }));
    }
}