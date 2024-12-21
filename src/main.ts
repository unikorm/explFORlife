import { Application, Assets, Sprite } from 'pixi.js';
import { addBackground } from './addBackground';
import { addWitcher } from './addWitcher';
import { Controller } from './Controller';

// Create a Pixi Application
const app = new Application();
const MOVE_SPEED = 3;

const setup = async () => {

    // Intialize the application.
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x99BB10,
        resizeTo: window
    })

    // Then adding the application's canvas to the DOM body.
    document.body.appendChild(app.canvas);
}

const preload = async () => {

    // Load the assets
    await Assets.load([{ alias: 'background', src: '/assets/background.png' }, { alias: 'witcher', src: '/assets/witcher.png' }]);
}

const gameLoop = (witcher: Sprite, controller: Controller) => {
    let dx = 0;
    let dy = 0;

    // calculate direction
    if (controller.isMovingRight()) dx += 1;
    if (controller.isMovingLeft()) dx -= 1;
    if (controller.isMovingUp()) dy -= 1;
    if (controller.isMovingDown()) dy += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2);
        dx *= factor;
        dy *= factor;
    }

    //apply movement
    witcher.x += dx * MOVE_SPEED;
    witcher.y += dy * MOVE_SPEED;

    // apply bounds
    const bounds = {
        left: witcher.width / 2,
        right: app.screen.width - witcher.width / 2,
        top: witcher.height / 2,
        bottom: app.screen.height - witcher.height / 2
    }

    witcher.x = Math.max(bounds.left, Math.min(witcher.x, bounds.right));
    witcher.y = Math.max(bounds.top, Math.min(witcher.y, bounds.bottom));
}

(async () => {
    await setup();
    await preload();

    addBackground(app);
    const witcher = addWitcher(app);
    const controller = new Controller();

    // Listen for frame updates
    app.ticker.add(() => {
        gameLoop(witcher, controller);
    });
})();

