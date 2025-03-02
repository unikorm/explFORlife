
// src/game/Player.ts

import { World } from './World';

export class Player {
    x: number;
    y: number;

    constructor(position: { x: number, y: number }) {
        this.x = position.x;
        this.y = position.y;
    }

    // Move the player in a direction
    move(direction: 'up' | 'down' | 'left' | 'right', world: World): boolean {
        // Calculate the new position
        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case 'up':
                newY -= 1;
                break;
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                break;
            case 'right':
                newX += 1;
                break;
        }

        // Check if the new position is valid (within bounds and passable)
        const targetCell = world.getCell(newX, newY);
        if (targetCell && targetCell.isPassable()) {
            // Update the player's position
            this.x = newX;
            this.y = newY;
            return true; // Movement was successful
        }

        return false; // Movement was blocked
    }
}