
// src/game/Renderer.ts

import { World } from './World';
import { Player } from './Player';
import { TerrainType } from './Cell';

export class GameRenderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cellSize: number;

    constructor(canvas: HTMLCanvasElement, cellSize: number = 6) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.cellSize = cellSize;
    }

    render(world: World): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < world.height; y++) {
            for (let x = 0; x < world.width; x++) {
                const cell = world.grid[y][x];

                switch (cell.terrainType) {
                    case TerrainType.WATER:
                        this.ctx.fillStyle  = '#4287f5'; // Blue
                        break;
                    case TerrainType.GRASS:
                        this.ctx.fillStyle = '#706238'; // Green
                        break;
                    case TerrainType.TREE:
                        this.ctx.fillStyle  = '#0f5511'; // Dark green
                        break;
                    default:
                        this.ctx.fillStyle = '#000000'; // Black (should never happen)
                }

                this.ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize - .04,
                    this.cellSize - .04
                );
            }
        }

        // // Draw the player
        // this.ctx.fillStyle = '#ff0000'; // Red
        // this.ctx.beginPath();
        // this.ctx.arc(
        //     player.x * this.cellSize + this.cellSize / 2,
        //     player.y * this.cellSize + this.cellSize / 2,
        //     this.cellSize / 2,
        //     0,
        //     Math.PI * 2
        // );
        // this.ctx.fill();
    }
}