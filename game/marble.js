var colours = {
    "C": [18, 151, 147],
    "P": [255, 65, 134],
    "Y": [255, 204, 102]

};

class Marble {
    constructor(posx, posy, colour) {
        this.posx = posx;
        this.posy = posy;

        this.init_posx = posx;
        this.init_posy = posy;

        this.colour = colour;
        this.xoffset = 0;
        this.yoffset = 0;
        this.radius = MARBLE_RADIUS;
        this.lock = false;
        this.on_ring = false;
        this.ring_id = null;

        this.draw = function() {
            noStroke();
            fill(colours[this.colour][0], colours[this.colour][1], colours[this.colour][2]);
            circle(this.posx, this.posy, this.radius);
            fill(255);
            circle(this.posx - 6, this.posy - 6, 10);

        }

        this.clicked = function() {
            var d = dist(mouseX, mouseY, this.posx, this.posy);
            /* Do not toggle clicked if the marble is already
            on a ring */
            if (d < this.radius / 2) {
                this.xoffset = mouseX - this.posx;
                this.yoffset = mouseY - this.posy;
                this.lock = true;
                return true;
            } else {
                this.xoffset = 0;
                this.yoffset = 0;
                this.lock = false;
                return false;
            }
        }

        this.dragged = function() {
            if (this.lock) {
                this.posx = mouseX - this.xoffset;
                this.posy = mouseY - this.yoffset;
            }
        }
    }

    get_colour() {
        return this.colour;
    }
    remove_marble() {
        noStroke();
        fill(BGN_COLOUR);
        circle(this.posx, this.posy, this.radius);

    }

}