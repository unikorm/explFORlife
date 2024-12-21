const buttons = document.querySelectorAll('.control-btn');
const activeKeys = new Set();

buttons.forEach(button => {
    const direction = button.id;

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

const sendControlState = () => {

    // after testing this will be replaced with webRTC implementation
    console.log('Active controls:', Array.from(activeKeys));
}