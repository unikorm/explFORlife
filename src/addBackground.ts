import { Application, Sprite } from 'pixi.js';

export const addBackground = (app: Application) => {

    // Create a background sprite.
    const background = Sprite.from('background');

    // Function to resize background
    const resizeBackground = () => {
        // Get window dimensions
        const screenWidth = app.screen.width;
        const screenHeight = app.screen.height;

        // Calculate scale ratio to cover the entire screen
        const scaleX = screenWidth / background.texture.width;
        const scaleY = screenHeight / background.texture.height;
        const scale = Math.max(scaleX, scaleY);

        // Apply the scale
        background.scale.set(scale);

        // Center the background
        background.x = screenWidth / 2;
        background.y = screenHeight / 2;
    };

    // Center background sprite anchor.
    background.anchor.set(0.5, 0.5);

    // Initial resize
    resizeBackground();

    // Listen for window resize events
    window.addEventListener('resize', () => {
        // Update app renderer size
        app.renderer.resize(window.innerWidth, window.innerHeight);

        // Resize background
        resizeBackground();
    });

    app.stage.addChild(background);
}