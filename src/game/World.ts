
import { Cell, TerrainType } from './Cell';
import { createNoise2D } from 'simplex-noise';

export class World {
    grid: Cell[][];
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.grid = [];

        // Initialize grid with grass cells
        for (let y = 0; y < height; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < width; x++) {
                row.push(new Cell(x, y, TerrainType.GRASS));
            }
            this.grid.push(row);
        }
    }

    // Generate terrain using noise function
    generateTerrain(seed?: number): void {
        // Create a noise function
        const noise2D = createNoise2D();

        // Parameters to tweak the noise
        const scale = 0.1; // Controls how zoomed in/out the noise is
        const waterThreshold = -0.3; // Values below this become water
        const treeThreshold = 0.3; // Values above this become trees

        // Fill our grid based on noise values
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Get a noise value between -1 and 1
                const noiseValue = noise2D(x * scale, y * scale);

                // Determine terrain type based on the noise value
                let terrainType: TerrainType;
                if (noiseValue < waterThreshold) {
                    terrainType = TerrainType.WATER;
                } else if (noiseValue > treeThreshold) {
                    terrainType = TerrainType.TREE;
                } else {
                    terrainType = TerrainType.GRASS;
                }

                // Update the cell's terrain
                this.grid[y][x].terrainType = terrainType;
            }
        }
    }

    // Get a cell at a specific position
    getCell(x: number, y: number): Cell | null {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return null; // Out of bounds
        }
        return this.grid[y][x];
    }

    // Find a valid starting position for the player (on grass)
    findValidStartPosition(): { x: number, y: number } {
        // Start from the center and spiral outward looking for grass
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);

        // If center is valid, use it
        if (this.getCell(centerX, centerY)?.isPassable()) {
            return { x: centerX, y: centerY };
        }

        // Otherwise spiral outward to find grass
        for (let radius = 1; radius < Math.max(this.width, this.height); radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Only check cells on the perimeter of the current radius
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const x = centerX + dx;
                        const y = centerY + dy;
                        const cell = this.getCell(x, y);
                        if (cell?.isPassable()) {
                            return { x, y };
                        }
                    }
                }
            }
        }

        // If no passable cell is found (unlikely), return the center anyway
        return { x: centerX, y: centerY };
    }
}