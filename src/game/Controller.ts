export class Controller {
    private keys: { [key: string]: boolean } = {};

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

    isMovingRight = (): boolean => {
        return this.keys['d'] || this.keys['arrowright'];
    }

    isMovingLeft = (): boolean => {
        return this.keys['a'] || this.keys['arrowleft'];
    }

    isMovingUp = (): boolean => {
        return this.keys['w'] || this.keys['arrowup'];
    }

    isMovingDown = (): boolean => {
        return this.keys['s'] || this.keys['arrowdown'];
    }
}