import { Application, Sprite } from 'pixi.js';

export const addBackground = (app: Application) => {

    // Create a background sprite.
    const background = Sprite.from('background');

    // Center background sprite anchor.
    background.anchor.set(0.5);

    background.width = app.screen.width * 1.2;
    background.scale.y = background.scale.x;

    // Position the background sprite in the center of the stage.
    background.x = app.screen.width / 2;
    background.y = app.screen.height / 2;

    app.stage.addChild(background);
}