import { ControlState } from "../../remote_controller/remote_controller";
import { Controller } from "../Controller";

export class GameConnection {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private ws: WebSocket;
    private remoteController: Controller | null = null;

    constructor(existingController: Controller) {

        this.remoteController = existingController;
        this.ws = new WebSocket('ws://localhost:8080');

        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        })

        this.setupWebSocket();
        this.setupPeerConnection();
    }

    private setupWebSocket = () => {
        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
            this.ws.send(JSON.stringify({ type: 'register', role: 'game' }));
            this.createOffer();
        };

        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);

            switch (data.type) {
                case 'answer':
                    try {
                        await this.peerConnection.setRemoteDescription(data.answer);
                        console.log('Successfully set remote description from answer');
                    } catch (error) {
                        console.error('Error setting remote description:', error);
                    }
                    break;
                case 'ice-candidate':
                    try {
                        await this.peerConnection.addIceCandidate(data.candidate);
                        console.log('Successfully added ICE candidate');
                    } catch (error) {
                        console.error('Error adding ICE candidate:', error);
                    }
                    break;
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };
    };

    private setupPeerConnection = () => {

        this.dataChannel = this.peerConnection.createDataChannel('controls');

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({ type: 'ice-candidate', target: 'controller', candidate: event.candidate }));

            }
        }

        this.dataChannel.onmessage = (event) => {
            const controlData: ControlState = JSON.parse(event.data);
            console.log('Received control data:', controlData);

            if (this.remoteController && controlData.type === 'controlUpdate') {
                this.remoteController.updateFromRemote(controlData.activeControls);
            }
        }

        // logging
        this.dataChannel.onopen = () => {
            console.log('Data channel opened with state:', this.dataChannel?.readyState);
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Peer connection state:', this.peerConnection.connectionState);
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        };
    }

    private createOffer = async () => {
        console.log('Creating offer...');

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.ws.send(JSON.stringify({
            type: 'offer',
            target: 'controller',
            offer
        }));
    }
}