import { Application, Assets } from 'pixi.js';
import { addBackground } from './addBackground';

// Create a Pixi Application
const app = new Application();

const setup = async () => {

    // Intialize the application.
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x1099bb,
        resizeTo: window
    })

    // Then adding the application's canvas to the DOM body.
    document.body.appendChild(app.canvas);
}

const preload = async () => {

    // Load the assets
    await Assets.load([{ alias: 'background', src: '/assets/background.png' }, { alias: 'witcher', src: '/assets/witcher.png' }]);
}

(async () => {
    await setup();
    await preload();

    addBackground(app);
})();

