import { ControlState } from "../remote_controller";

export class RemoteControllerConnection {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private ws: WebSocket;

    constructor() {

        this.ws = new WebSocket('ws://172.20.10.2:8080'); // here will be IP address of the server (computer where server is running)

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
        });

        this.peerConnection.onconnectionstatechange = () => {
            console.log('WebRTC Connection State:', this.peerConnection.connectionState);

            if (this.peerConnection.connectionState === 'failed') {
                console.log('Connection Details:', {
                    iceGatheringState: this.peerConnection.iceGatheringState,
                    signalingState: this.peerConnection.signalingState,
                    localDescription: this.peerConnection.localDescription,
                    remoteDescription: this.peerConnection.remoteDescription
                });
                this.attemptReconnection();
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
            console.log('WebSocket connected, registering as controller...');

            // send message to server that this is controller
            this.ws.send(JSON.stringify({ type: 'register', role: 'controller' }));
        }

        // onmessage means that message is received
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);

            switch (data.type) {
                case 'offer':
                    console.log('Received offer from game, processing...');
                    await this.handleOffer(data.offer);
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

        // ondatachannel waits for data channel event from game
        this.peerConnection.ondatachannel = (event) => {

            // store recieved data channel
            this.dataChannel = event.channel;

            // onopne means that connection is established and ready to send data
            this.dataChannel.onopen = () => {
                console.log('WebRTC connection established, controller ready to send');
                console.log('Data channel state:', this.dataChannel?.readyState);
                console.log('Data channel opened!', {
                    state: this.dataChannel?.readyState,
                    id: this.dataChannel?.id,
                    bufferedAmount: this.dataChannel?.bufferedAmount
                });

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
                console.log('Data channel state at error:', this.dataChannel?.readyState);
            };

            this.dataChannel.onclose = () => {
                console.log('Data channel closed');
                window.webRTCSendControl = () => {
                    console.log('Connection lost, cannot send controls');
                };
            };

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
                this.ws.send(JSON.stringify({ type: 'ice-candidate', target: 'game', candidate: event.candidate }));
            }
        }
    }

    private handleOffer = async (offer: RTCSessionDescriptionInit) => {

        console.log('Handling offer...');

        // set remote description from offer and create answer
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();

        // set local description as answer
        await this.peerConnection.setLocalDescription(answer);

        console.log('Sending answer to game...');

        // send answer to game through WS server
        this.ws.send(JSON.stringify({ type: 'answer', target: 'game', answer }));
    }

    private attemptReconnection = () => {
        if (this.peerConnection.connectionState === 'failed') {
            console.log('Attempting to recover connection...');
            this.peerConnection.restartIce();
        }
    }
}