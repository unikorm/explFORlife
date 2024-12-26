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

        // onerror means that connection has some error
        this.ws.onerror = (error) => {
            console.error('WebSocket connection error:', error);
        };

        // creating RTCPeerConnection with STUN servers
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ],
            iceTransportPolicy: 'all',
            iceCandidatePoolSize: 10,
            rtcpMuxPolicy: 'require',
            bundlePolicy: 'max-bundle'
        })

        this.peerConnection.onconnectionstatechange = () => {
            console.log('WebRTC Connection State:', this.peerConnection.connectionState);

            if (this.peerConnection.connectionState === 'failed') {
                console.log('Connection Details:', {
                    iceGatheringState: this.peerConnection.iceGatheringState,
                    signalingState: this.peerConnection.signalingState,
                    localDescription: this.peerConnection.localDescription,
                    remoteDescription: this.peerConnection.remoteDescription
                });
            }
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE Gathering State:', this.peerConnection.iceGatheringState);
            if (this.peerConnection.iceConnectionState === 'failed') {
                // Log all current ICE candidates
                const transceivers = this.peerConnection.getTransceivers();
                console.log('Current transceivers:', transceivers);
            }
        };

        this.setupWebSocket();
        this.setupPeerConnection();
    }

    private setupWebSocket = () => {
        // onopen means that connection is established
        this.ws.onopen = () => {
            console.log('WebSocket connected, registering as game...');

            // send message to server that this is game
            this.ws.send(JSON.stringify({ type: 'register', role: 'game' }))

            // create WebRTC offer
            this.createOffer();

            // onmessage means that message is received
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
            }
        }
    }

    private setupPeerConnection = () => {

        // offering peer creates data channel that is used for sending control updates
        this.dataChannel = this.peerConnection.createDataChannel('controls', {
            ordered: true,
            // Add these parameters for better real-time performance
            maxRetransmits: 0,
            protocol: 'webrtc-datachannel',
            negotiated: false,
        });
        console.log('Data channel created:', this.dataChannel);

        this.dataChannel.onopen = () => {
            console.log('Data channel opened with state:', this.dataChannel?.readyState);
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
        };

        this.dataChannel.onmessage = (event) => {
            const controlData: ControlState = JSON.parse(event.data);

            if (this.remoteController && controlData.type === 'controlUpdate') {
                this.remoteController.updateFromRemote(controlData.activeControls);
            }
        }

        // onicecandidate here are send through WS server to the other peer cause we don't have direct connection yet
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', {
                    type: event.candidate.type,
                    protocol: event.candidate.protocol,
                    address: event.candidate.address,
                    port: event.candidate.port
                })
            }
            if (event.candidate) {
                this.ws.send(JSON.stringify({ type: 'ice-candidate', target: 'controller', candidate: event.candidate }));

            }
        }
    }

    private createOffer = async () => {

        console.log('Creating offer...');

        // create offer and set it as local description
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        console.log('Sending offer to controller...');

        // send offer to controller through WS server
        this.ws.send(JSON.stringify({
            type: 'offer',
            target: 'controller',
            offer
        }));
    }
}