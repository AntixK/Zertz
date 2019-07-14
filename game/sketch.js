var BGN_COLOUR = 51
var rings = [];
var marbles = [];
var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 900;

var player1_marbles_pos = {};
var player2_marbles_pos = {};

function setup() {
    // put setup code here
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    background(BGN_COLOUR);

    reset_canvas();

}

function reset_canvas() {

    // Setup the rings
    let posx = CANVAS_WIDTH / 10;
    let posy = CANVAS_HEIGHT / 3;

    alph = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    num_rings = [4, 5, 6, 7, 6, 5, 4];
    for (let i = 0; i < alph.length; ++i) {
        posx += 64;
        posy = CANVAS_HEIGHT / 3 - (num_rings[i] % 4) * 32;
        for (j = 0; j < num_rings[i]; ++j) {
            let ring = new Ring(posx, posy, alph[i].concat(String(j + 1)));
            rings.push(ring);
            posy += 66;
        }
    }

    // Setup the marbles
    posx = CANVAS_WIDTH / 1.463;
    posy = CANVAS_HEIGHT / 6;
    num_marbles = [10, 8, 6];
    c = ["C", "P", "Y"];
    for (let i = 0; i < c.length; ++i) {
        posx += 66;
        posy = CANVAS_HEIGHT / 6 + i * 52;
        for (j = 0; j < num_marbles[i]; ++j) {
            let marble = new Marble(posx, posy, c[i]);
            marbles.push(marble);
            posy += 56;
        }
    }


    // Setup the empty marble spaces for the players
    posx = 150;
    posy = 750;
    num_marbles = [6, 5, 4];
    let x = []
    for (let i = 0; i < 3; ++i) {
        x = []
        for (j = 0; j < num_marbles[i]; ++j) {
            x.push(posx);
            posx += 50;
        }

        player1_marbles_pos[c[i]] = { 'posx': x, 'posy': posy };
        player2_marbles_pos[c[i]] = { 'posx': x, 'posy': posy - 700 };

        posx += 20
    }
}

function draw() {
    background(BGN_COLOUR);
    // put drawing code here
    for (let i = 0; i < rings.length; ++i) {
        rings[i].draw();
    }

    for (let i = 0; i < marbles.length; ++i) {
        marbles[i].draw();
    }

    for (var key in player1_marbles_pos) {
        for (let i = 0; i < player1_marbles_pos[key]['posx'].length; ++i) {
            noStroke();
            fill(BGN_COLOUR + 50);
            circle(player1_marbles_pos[key]['posx'][i], player1_marbles_pos[key]['posy'], 45);
            fill(BGN_COLOUR + 100);
            circle(player1_marbles_pos[key]['posx'][i] + 7, player1_marbles_pos[key]['posy'] + 7, 10);

            noStroke();
            fill(BGN_COLOUR + 50);
            circle(player2_marbles_pos[key]['posx'][i], player2_marbles_pos[key]['posy'], 45);
            fill(BGN_COLOUR + 100);
            circle(player2_marbles_pos[key]['posx'][i] + 7, player2_marbles_pos[key]['posy'] + 7, 10);
        }

    }

}

function mousePressed() {
    for (let i = 0; i < marbles.length; ++i) {
        if (marbles[i].clicked()) { return; }
    }

    let ring_remove_id = null;
    for (let i = 0; i < rings.length; ++i) {
        if (rings[i].clicked())
            ring_remove_id = i;
    }
    if (ring_remove_id != null) {
        print("i am here!")
        rings.splice(ring_remove_id, 1);
        return;
    }
}

function mouseDragged() {
    for (let i = 0; i < marbles.length; ++i) {
        marbles[i].dragged();
    }
}

function mouseReleased() {
    let marble_on_ring = false;
    for (let i = 0; i < marbles.length; ++i) {
        // check whether the marble is clicked
        if (marbles[i].lock) {
            for (let j = 0; j < rings.length; ++j) {
                var d = dist(mouseX, mouseY, rings[j].posx, rings[j].posy);
                /* check whether the mouse is inside the ring and if the
                ring is empty */
                if (d < 32.5 && !rings[j].has_marble) {
                    marbles[i].posx = rings[j].posx;
                    marbles[i].posy = rings[j].posy;

                    /* make the marble stick to its ring unless
                    moved to another ring*/
                    marbles[i].init_posx = marbles[i].posx;
                    marbles[i].init_posy = marbles[i].posy;

                    marbles[i].on_ring = true;

                    // update the ring if the marble has changed the rings
                    if (rings[j].id != marbles[i].ring_id && marbles[i].ring_id != null) {

                        /* we do this way, because the index of the rings
                        keep changin as and when the rings get removed*/
                        for (let k = 0; k < rings.length; ++k) {
                            if (rings[k].id == marbles[i].ring_id) {
                                rings[k].has_marble = false;
                                break;
                            }
                        }
                    }

                    marbles[i].ring_id = rings[j].id;
                    marble_on_ring = true; // flag to check a marble has been placed on a ring
                    rings[j].has_marble = true;
                    break;
                }
                marbles[i].lock = false;
            }
            /* if the dragged marble is not moved to another
            ring, reset it to its previous position*/
            if (!marble_on_ring) {

                marbles[i].posx = marbles[i].init_posx;
                marbles[i].posy = marbles[i].init_posy;
                marbles[i].on_ring = false;

                // reset the ring that had the marble (if it did).
                if (marbles[i].ring_id != null) {
                    rings[marbles[i].ring_id].has_marble = false;
                }


            }
        }


    }

}