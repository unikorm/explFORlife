
import { World } from './World';
import { Player } from './Player';
import { GameRenderer } from './Renderer';

let WORLD_WIDTH: number;
let WORLD_HEIGHT: number;
const CELL_SIZE = 4;

// on DOM load render canvas
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    resizeCanvas(canvas);

    window.addEventListener('resize', () => resizeCanvas(canvas));
});

// get actual window size and then render
const resizeCanvas = (canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    WORLD_HEIGHT = Math.ceil(canvas.height / CELL_SIZE);
    WORLD_WIDTH = Math.ceil(canvas.width / CELL_SIZE);
    console.log(WORLD_WIDTH, WORLD_HEIGHT);

    render(canvas);
}

// create world and render
const render = (canvas: HTMLCanvasElement) => {
    const world = new World(WORLD_WIDTH, WORLD_HEIGHT);
    const renderer = new GameRenderer(canvas, CELL_SIZE);
    renderer.render(world);
}