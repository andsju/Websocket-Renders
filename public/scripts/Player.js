export default class Player {
    /**
     * Creates an instance of Player.
     * @param {string} id
     * @param {string} username
     * @param {string} color
     * @param {number} tile
     * @param {number} x
     * @param {number} y
     * @param {number} vx
     * @param {number} vy
     * @memberof Player
     */
    constructor(id, username, color, tile, x, y, vx, vy) {
        this.id = id;
        this.username = username;
        this.color = color;
        this.tile = tile;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.maxSpeed = 3;
        this.friction = 0.98;
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

    /**
     * move inside canvas, apply friction
     *
     * @param {HTMLCanvasElement} canvas
     * @memberof Player
     */
    move(canvas) {

        if (this.vx > 0) {
            this.x += this.x + this.vx + this.tile < canvas.width ? this.vx : 0;
            if (this.x > canvas.width - this.tile) {
                this.x = canvas.width - this.tile;
            }
        } else if (this.vx < 0) {
            this.x += this.x - this.vx > 0 ? this.vx : 0;
            if (this.x < 0) {
                this.x = 0;
            }
        }

        if (this.vy > 0) {
            this.y += this.y + this.vy + this.tile < canvas.height ? this.vy : 0;
            if (this.y > canvas.height - this.tile) {
                this.y = canvas.height - this.tile;
            }
        } else if (this.vy < 0) {
            this.y += this.y - this.vy > 0 ? this.vy : 0;
            if (this.y < 0) {
                this.y = 0;
            }
        }

        this.vx *= this.friction;
        this.vy *= this.friction;

    }
}