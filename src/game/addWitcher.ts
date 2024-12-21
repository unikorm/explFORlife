import { Application, Sprite } from 'pixi.js';

export const addWitcher = (app: Application) => {

    // Create character sprite
    const witcher = Sprite.from('witcher');

    // resize witcher position
    const resizeWitcher = () => {
        // Center the character
        witcher.x = app.screen.width / 2 + 70;  // Center horizontally
        witcher.y = app.screen.height / 2 - 120; // Center vertically
    }

    // Set the character's anchor point to its center
    witcher.anchor.set(0.5, 0.5);

    // Set initial scale if needed
    witcher.scale.set(0.6);

    // Initial resize
    resizeWitcher();

    // Listen for window resize events
    window.addEventListener('resize', () => {
        // Update app renderer size
        app.renderer.resize(window.innerWidth, window.innerHeight);

        // resize witcher position
        resizeWitcher();
    })

    // Add character to the stage
    app.stage.addChild(witcher);

    return witcher;
}