import { ControlState } from "../remote_controller";

export class RemoteControllerConnection {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private ws: WebSocket;

    constructor() {
        console.log('Initializing RemoteControllerConnection...');

        this.ws = new WebSocket('ws://localhost:8000');

        this.ws.onerror = (error) => {
            console.error('WebSocket connection error:', error);
        };

        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        });

        // Log connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('WebRTC Connection State:', this.peerConnection.connectionState);
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', this.peerConnection.iceConnectionState);
        };

        this.setupWebSocket();
        this.setupPeerConnection();
    }

    private setupWebSocket = () => {

        this.ws.onopen = () => {
            console.log('WebSocket connected, registering as controller...');
            this.ws.send(JSON.stringify({ type: 'register', role: 'controller' }));
        }

        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);

            switch (data.type) {
                case 'offer':
                    console.log('Received offer from game, processing...');
                    await this.handleOffer(data.offer);
                    break;

                case 'ice-candidate':
                    console.log('Received ICE candidate from game');
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

    private setupPeerConnection = () => {

        this.peerConnection.ondatachannel = (event) => {

            this.dataChannel = event.channel;

            this.dataChannel.onopen = () => {
                console.log('WebRTC connection established, controller ready to send');

                window.webRTCSendControl = (controlState: ControlState) => {
                    if (this.dataChannel && this.dataChannel.readyState === 'open') {
                        try {
                            this.dataChannel.send(JSON.stringify(controlState));
                        } catch (error) {
                            console.error('Error sending control state:', error);
                        }
                    }
                }
            }

            this.dataChannel.onerror = (error) => {
                console.error('Data channel error:', error);
            };

            this.dataChannel.onclose = () => {
                console.log('Data channel closed');
                window.webRTCSendControl = () => {
                    console.log('Connection lost, cannot send controls');
                };
            };

        }

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({ type: 'ice-candidate', target: 'game', candidate: event.candidate }));
            }
        }
    }

    private handleOffer = async (offer: RTCSessionDescriptionInit) => {
        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();

        await this.peerConnection.setLocalDescription(answer);

        this.ws.send(JSON.stringify({ type: 'answer', target: 'game', answer }));
    }
}