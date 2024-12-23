import { ControlState } from "../remote_controller";

class RemoteControllerConnection {
    // these are our three main communication tools
    private peerConnection: RTCPeerConnection;  // direct connection to the game
    private dataChannel: RTCDataChannel | null = null;  // channel for sending control data
    private ws: WebSocket;  // initial connection to the signaling server

    constructor() {

        // connect to the same signaling server as the game
        this.ws = new WebSocket('ws://localhost:8080');

        // set up our peer connection with the same STUN server
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // initialize both our connections
        this.setupWebSocket();
        this.setupPeerConnection();
    }

    private setupWebSocket = () => {

        // when we first connect to the signaling server
        this.ws.onopen = () => {
            // announce ourselves as the controller
            this.ws.send(JSON.stringify({ type: 'register', role: 'controller' }));
        }

        // handle incoming messages from the signaling server
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'offer':
                    // game is trying to connect - handle their offer
                    await this.handleOffer(data.offer);
                    break;

                case 'ice-candidate':
                    // game suggested a connection path
                    this.peerConnection.addIceCandidate(data.candidate);
                    break;
            }
        }
    }

    private setupPeerConnection = () => {

        // wait for the game to create the data channel
        this.peerConnection.ondatachannel = (event) => {

            // store the channel when we receive it
            this.dataChannel = event.channel;

            // when the channel is open, set up our global send function
            this.dataChannel.onopen = () => {
                console.log('WebRTC connection established, controller ready to send');

                // create the global function that sendControlState will use
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

            // handle any errors
            this.dataChannel.onerror = (error) => {
                console.error('Data channel error:', error);
            };

            // handle channel closing
            this.dataChannel.onclose = () => {
                console.log('Data channel closed');
                // remove the send function when connection is lost
                window.webRTCSendControl = () => {
                    console.log('Connection lost, cannot send controls');
                };
            };

        }

        // handle our own ICE candidates (possible connection paths)
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // send our connection paths to the game
                this.ws.send(JSON.stringify({ type: 'ice-candidate', target: 'game', candidate: event.candidate }));
            }
        }
    }

    private handleOffer = async (offer: RTCSessionDescriptionInit) => {
        // save the game's connection details
        await this.peerConnection.setRemoteDescription(offer);

        // create an answer to the game's offer
        const answer = await this.peerConnection.createAnswer();

        // set the answer as our local description
        await this.peerConnection.setLocalDescription(answer);

        // send the answer back to the game
        this.ws.send(JSON.stringify({ type: 'answer', target: 'game', answer }));
    }
}