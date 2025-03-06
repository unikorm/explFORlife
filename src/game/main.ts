
// src/game/main.ts

import { World } from './World';
import { Player } from './Player';
import { GameRenderer } from './Renderer';

// Game parameters
let WORLD_WIDTH: number;
let WORLD_HEIGHT: number;
const CELL_SIZE = 30;    // Size of each cell in pixels

// function to resize game canvas to match the window size
const resizeCanvas = (canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    WORLD_HEIGHT = Math.ceil(canvas.height / CELL_SIZE);
    WORLD_WIDTH = Math.ceil(canvas.width / CELL_SIZE);
    console.log(WORLD_WIDTH, WORLD_HEIGHT);
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    resizeCanvas(canvas); 

    window.addEventListener('resize', () => resizeCanvas(canvas));

    // Create the world and generate terrain
    // const world = new World(WORLD_WIDTH, WORLD_HEIGHT);
    // world.generateTerrain();

    // Create the player at a valid starting position
    // const startPosition = world.findValidStartPosition();
    // const player = new Player(startPosition);

    // Create the renderer
    // const renderer = new GameRenderer(canvas, CELL_SIZE);

    // Set up keyboard controls
    // document.addEventListener('keydown', (event) => {
    //     let moved = false;

    //     // Handle arrow keys and WASD
    //     switch (event.key) {
    //         case 'ArrowUp':
    //         case 'w':
    //             moved = player.move('up', world);
    //             break;
    //         case 'ArrowDown':
    //         case 's':
    //             moved = player.move('down', world);
    //             break;
    //         case 'ArrowLeft':
    //         case 'a':
    //             moved = player.move('left', world);
    //             break;
    //         case 'ArrowRight':
    //         case 'd':
    //             moved = player.move('right', world);
    //             break;
    //     }

    //     // If the player moved, re-render the game
    //     if (moved) {
    //         renderer.render(world, player);
    //     }
    // });

    // // Initial render
    // renderer.render(world, player);

    console.log('Game initialized!');
});