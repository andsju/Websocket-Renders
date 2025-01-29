export default class Player {
    /**
     * Creates an instance of Player.
     * @param {string} id
     * @param {string} username
     * @param {string} color
     * @param {number} tile
     * @param {number} x
     * @param {number} y
     * @memberof Player
     */
    constructor(id, username, color, tile, x, y) {
        this.id = id;
        this.username = username;
        this.color = color;
        this.tile = tile;
        this.x = x;
        this.y = y;
    }

    /**
     *
     *
     * @param {CanvasRenderingContext2D} ctx
     * @memberof Player
     */
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.tile, this.tile);
        ctx.strokeRect(this.x, this.y, this.tile, this.tile);
    }

}