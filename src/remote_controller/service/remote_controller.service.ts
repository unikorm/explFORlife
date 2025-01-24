import { ControlState } from "../remote_controller";

export class RemoteControllerConnection {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private ws: WebSocket;

    constructor() {
        this.ws = new WebSocket('ws://192.168.1.71:8080');

        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

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
                    try {
                        await this.handleOffer(data.offer);
                        console.log('Successfully handled offer');
                    } catch (error) {
                        console.error('Error handling offer:', error);
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

    private setupPeerConnection = () => {

        this.peerConnection.ondatachannel = (event) => {

            this.dataChannel = event.channel;

            this.dataChannel.onopen = () => {
                console.log('WebRTC connection established, controller ready to send');
                console.log('Data channel state:', this.dataChannel?.readyState);

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

            // looging
            this.dataChannel.onerror = (error) => {
                console.error('Data channel error:', error);
                console.log('Data channel state at error:', this.dataChannel?.readyState);
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

        console.log('Handling offer...');

        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        console.log('Sending answer to game...');

        this.ws.send(JSON.stringify({ type: 'answer', target: 'game', answer }));
    }
}