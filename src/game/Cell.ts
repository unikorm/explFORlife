
export enum TerrainType {
    WATER,
    GRASS,
    TREE
}

export class Cell {
    terrainType: TerrainType;
    x: number;
    y: number;

    constructor(x: number, y: number, terrainType: TerrainType) {
        this.x = x;
        this.y = y;
        this.terrainType = terrainType;
    }

    // Determine if the player can walk on this cell
    isPassable(): boolean {
        return this.terrainType === TerrainType.GRASS;
        // Only grass is passable, water and trees block movement for now, in the future half speed on water, and trees can be cut down...
    }
}