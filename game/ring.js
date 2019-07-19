class Ring {
    constructor(posx, posy, id) {

        this.id = id;
        this.posx = posx;
        this.posy = posy;

        this.ring_colour = 245;
        this.has_marble = false;
        this.removable = false;


        this.draw = function() {
            stroke(BGN_COLOUR);
            fill(this.ring_colour);
            circle(this.posx, this.posy, RING_RADIUS);
            fill(BGN_COLOUR);
            circle(this.posx, this.posy, RING_RADIUS / 3.25);
        }

        this.clicked = function() {
            if (this.removable && !this.has_marble) {
                var d = dist(mouseX, mouseY, this.posx, this.posy);
                if (d < RING_RADIUS / 2) {
                    this.remove_ring();
                    return true;
                }
            }
            return false;
        }

    }

    update_has_marble(has_marble) {
        this.has_marble = has_marble;
        //this.removable = !has_marble;
    }

    remove_ring() {
        stroke(BGN_COLOUR);
        fill(BGN_COLOUR);
        circle(this.posx, this.posy, RING_RADIUS);
    }

}