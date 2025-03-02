
// src/game/main.ts

import { World } from './World';
import { Player } from './Player';
import { GameRenderer } from './Renderer';

// Game parameters
const WORLD_WIDTH = 40;  // Width of the world in cells
const WORLD_HEIGHT = 30; // Height of the world in cells
const CELL_SIZE = 20;    // Size of each cell in pixels

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    // Set canvas size to match our world size
    canvas.width = WORLD_WIDTH * CELL_SIZE;
    canvas.height = WORLD_HEIGHT * CELL_SIZE;

    // Create the world and generate terrain
    const world = new World(WORLD_WIDTH, WORLD_HEIGHT);
    world.generateTerrain();

    // Create the player at a valid starting position
    const startPosition = world.findValidStartPosition();
    const player = new Player(startPosition);

    // Create the renderer
    const renderer = new GameRenderer(canvas, CELL_SIZE);

    // Set up keyboard controls
    document.addEventListener('keydown', (event) => {
        let moved = false;

        // Handle arrow keys and WASD
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                moved = player.move('up', world);
                break;
            case 'ArrowDown':
            case 's':
                moved = player.move('down', world);
                break;
            case 'ArrowLeft':
            case 'a':
                moved = player.move('left', world);
                break;
            case 'ArrowRight':
            case 'd':
                moved = player.move('right', world);
                break;
        }

        // If the player moved, re-render the game
        if (moved) {
            renderer.render(world, player);
        }
    });

    // Initial render
    renderer.render(world, player);

    console.log('Game initialized!');
});