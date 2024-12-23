export class Controller {
    private keys: { [key: string]: boolean } = {};
    private remoteKeys: string[] = [];

    constructor() {

        // while keydown, set the key to true
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });


        // when keyup, set the key to false
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    // method to update from remote controller
    updateFromRemote(activeKeys: string[]) {
        this.remoteKeys = activeKeys;
    }

    isMovingRight = (): boolean => {
        return this.keys['d'] || this.keys['arrowright'] || this.remoteKeys.includes('right');
    }

    isMovingLeft = (): boolean => {
        return this.keys['a'] || this.keys['arrowleft'] || this.remoteKeys.includes('left');
    }

    isMovingUp = (): boolean => {
        return this.keys['w'] || this.keys['arrowup'] || this.remoteKeys.includes('up');
    }

    isMovingDown = (): boolean => {
        return this.keys['s'] || this.keys['arrowdown'] || this.remoteKeys.includes('down');
    }
}