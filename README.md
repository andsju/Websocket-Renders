# Websocket-Renders


Instructions:

1. Clone repo
2. Open terminal and install dependencies, cmd: `npm install`
3. Run application, cmd: `npm run start` 
3. Open multiple browsers and enter url `localhost:8888`
4. In browser, lock in username and click "Play"
5. Navigate using keyboard arrow keys 

You should now see colored rectangles moving around. Navigate in mobile devices - tap screen (should move colored rectangle tile by tile...but not implemented) 

### Branch tiles
Canvas application using websocket: moving tile by tile 

Platformer tile-based 

### Branch motions
Canvas application using websocket: moving step by step

Motion: *Fish in water...*

### Websocket tip 
Instantiate players (shared game objects) using classes. Make websocket send user interaction events. Let server know about things happening in 'server land', listen to events and render in 'browser land' - kepp listening on events.     