
import { Cell, TerrainType } from './Cell';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

export class World {
    grid: Cell[][];
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.grid = [];

        const noise2D = createNoise2D(alea('ada'));
        console.log(noise2D(0, 0));
        const scale = 0.009;
        const waterThreshold = -0.4;
        const deepWaterThreshold = -0.6;
        const treeThreshold = 0.4;
        const mountainThreshold = 0.7;

        // Initialize grid with cells based on noise
        for (let y = 0; y < height; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < width; x++) {
                const noiseValue = noise2D(x * scale, y * scale);

                let terrainType: TerrainType;
                if (noiseValue < deepWaterThreshold) {
                    terrainType = TerrainType.DEEP_WATER;
                } else if (noiseValue > mountainThreshold) {
                    terrainType = TerrainType.MOUNTAIN;
                } else if (noiseValue > treeThreshold) {
                    terrainType = TerrainType.TREE;
                } else if (noiseValue < waterThreshold) {
                    terrainType = TerrainType.WATER;
                } else {
                    terrainType = TerrainType.GRASS;
                }

                row.push(new Cell(x, y, terrainType));
            }
            this.grid.push(row);
        }
    }

    // // Get a cell at a specific position
    // getCell(x: number, y: number): Cell | null {
    //     if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
    //         return null; // Out of bounds
    //     }
    //     return this.grid[y][x];
    // }

    // // Find a valid starting position for the player (on grass)
    // findValidStartPosition(): { x: number, y: number } {
    //     // Start from the center and spiral outward looking for grass
    //     const centerX = Math.floor(this.width / 2);
    //     const centerY = Math.floor(this.height / 2);

    //     // If center is valid, use it
    //     if (this.getCell(centerX, centerY)?.isPassable()) {
    //         return { x: centerX, y: centerY };
    //     }

    //     // Otherwise spiral outward to find grass
    //     for (let radius = 1; radius < Math.max(this.width, this.height); radius++) {
    //         for (let dx = -radius; dx <= radius; dx++) {
    //             for (let dy = -radius; dy <= radius; dy++) {
    //                 // Only check cells on the perimeter of the current radius
    //                 if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
    //                     const x = centerX + dx;
    //                     const y = centerY + dy;
    //                     const cell = this.getCell(x, y);
    //                     if (cell?.isPassable()) {
    //                         return { x, y };
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     // If no passable cell is found (unlikely), return the center anyway
    //     return { x: centerX, y: centerY };
    // }
}