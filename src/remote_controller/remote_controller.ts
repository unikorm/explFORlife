import { RemoteControllerConnection } from "./service/remote_controller.service";

const remoteConnection = new RemoteControllerConnection();

export type ControlState = {
    type: 'controlUpdate';
    activeControls: string[];
}

const buttons = document.querySelectorAll('.control-btn');
const activeKeys = new Set();

buttons.forEach(button => {
    const direction = button.id;

    // Prevent context menu (long press menu)
    button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    });

    // Handle mouse events
    button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        activeKeys.add(direction);
        sendControlState();
    });

    button.addEventListener('mouseup', (event) => {
        event.preventDefault();
        activeKeys.delete(direction);
        sendControlState();
    });

    button.addEventListener('mouseleave', (event) => {
        event.preventDefault();
        activeKeys.delete(direction);
        sendControlState();
    });

    // Handle touch events
    button.addEventListener('touchstart', (event) => {
        event.preventDefault();
        activeKeys.add(direction);
        sendControlState();
    });

    button.addEventListener('touchend', (event) => {
        event.preventDefault();
        activeKeys.delete(direction);
        sendControlState();
    });
})

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
});

export const sendControlState = () => {

    const controlState: ControlState = {
        type: 'controlUpdate',
        activeControls: Array.from(activeKeys) as string[]
    };

    console.log('Control state to send:', controlState);

    // this will be called by our RemoteControllerConnection when the connection is ready
    if (window.webRTCSendControl) {
        window.webRTCSendControl(controlState);
    }
}

// we need to declare this for TypeScript
declare global {
    interface Window {
        webRTCSendControl: (state: ControlState) => void;
    }
}
