## explFORlife  
game of my fantasy

### next steps to do:
- generated random background/world in web worker (noise function)
- comunication between controller and game (2 separate devices)
- etc

________________________________

flow of webRTC controller === game:  
<img width="855" alt="game logic-diagram" src="https://github.com/user-attachments/assets/19022ad6-005e-480b-9719-bb8ba01b0cc0" />  

### actual file logic
i have Cell.ts what handle the smallest unit what is rendered, her color and other logic, then i have World.ts what creates actual world, one time at the start, one big world, then i have Renderer.ts what render on that world data actual final looking, and i would had Game.ts what will handle initialization and game loop, that is for now, Claude giving me options and i rethinking it in the process, cause i know his code wouldn't work as it is...
