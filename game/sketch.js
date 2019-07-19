const BGN_COLOUR = 51
const alph = ["A", "B", "C", "D", "E", "F", "G"]
const num_rings = [4, 5, 6, 7, 6, 5, 4];

var rings = [];
var ring_labels = [];
var marbles = [];

var CANVAS_HEIGHT = 810; //window.innerHeight / 1.2;
var CANVAS_WIDTH = 1000; //window.innerHeight / 0.9;

const RING_RADIUS = CANVAS_HEIGHT * 65 / 900;
const MARBLE_RADIUS = CANVAS_HEIGHT * 45 / 900;

const ASSIST = true;
var player1_marbles_pos = {};
var player2_marbles_pos = {};

var board_state = {
    'rings': [],
    'marbles': []
};
var currState;

function setup() {
    // put setup code here
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    reset_canvas();
}

function reset_canvas() {
    print("resetting canvas");
    background(BGN_COLOUR);
    rings = [];
    marbles = [];
    player1_marbles_pos = {};
    player2_marbles_pos = {};

    // Setup the rings
    let posx = CANVAS_WIDTH * 230 / 1000;
    let posy = CANVAS_HEIGHT * 340 / 900;

    let temp_rings = [];

    // Initialize rings with nulls
    for (let i = 0; i < 9; ++i) {
        temp_rings.push(null);
    }
    rings.push(temp_rings);

    for (let i = 0; i < alph.length; ++i) {
        posx += RING_RADIUS - 1;
        posy = (CANVAS_HEIGHT * 340 / 900) - (num_rings[i] % 4) * RING_RADIUS / 2;
        temp_rings = [];
        temp_rings.push(null);
        for (j = 0; j < num_rings[i]; ++j) {
            if (j == 0)
                ring_labels.push([posx - 10, posy - 56, alph[i].concat(String(j + 1))]);
            let ring = new Ring(posx, posy, alph[i].concat(String(j + 1)));
            temp_rings.push(ring);
            posy += RING_RADIUS + 1;
        }
        rings.push(temp_rings);
        ring_labels.push([posx - 10, posy + 10, alph[i].concat(String(j))]);
    }

    /* Fill up rings with extra nulls
    This makes for easier analysis of removable rings later*/
    for (let i = 0; i < rings.length; ++i) {
        for (let j = rings[i].length - 1; j < 8; ++j) {
            rings[i].push(null);
        }
    }
    temp_rings = [];
    for (let i = 0; i < 9; ++i) {
        temp_rings.push(null);
    }
    rings.push(temp_rings);

    // Tranpose so that the matrix matches the rendering
    rings = transpose(rings);

    // Setup the marbles
    posx = CANVAS_WIDTH * 725 / 1000;
    posy = CANVAS_HEIGHT * 180 / 900;
    num_marbles = [10, 8, 6];
    c = ["C", "P", "Y"];
    for (let i = 0; i < c.length; ++i) {
        posx += MARBLE_RADIUS + 10;
        posy = (CANVAS_HEIGHT * 180 / 900) + i * MARBLE_RADIUS;
        for (j = 0; j < num_marbles[i]; ++j) {
            let marble = new Marble(posx, posy, c[i]);
            marbles.push(marble);
            posy += MARBLE_RADIUS + 10;
        }
    }

    // Setup the empty marble spaces for the players
    posx = CANVAS_WIDTH * 100 / 1000;
    posy = CANVAS_HEIGHT * 800 / 900;
    num_marbles = [6, 5, 4];
    let x = []
    for (let i = 0; i < 3; ++i) {
        x = []
        for (j = 0; j < num_marbles[i]; ++j) {
            x.push(posx);
            posx += 50;
        }

        player1_marbles_pos[c[i]] = { 'posx': x, 'posy': posy };
        player2_marbles_pos[c[i]] = { 'posx': x, 'posy': posy - (CANVAS_HEIGHT * 710 / 900) };

        posx += 20
    }

    // Display Controls
    posx = CANVAS_WIDTH * 50 / 1000;
    posy = CANVAS_HEIGHT * 300 / 900;
    let reset_text = select("#reset");
    reset_text.position(posx, posy);

    posy += CANVAS_HEIGHT * 80 / 900;
    let undo_text = select("#undo");
    undo_text.position(posx, posy);

    posy += CANVAS_HEIGHT * 80 / 900;
    let redo_text = select("#redo");
    redo_text.position(posx, posy);

    // Reset board state
    board_state = {
        'rings': [],
        'marbles': []
    };
    currState = -1;
    update_board_state();


}

function draw() {
    background(BGN_COLOUR);
    /* the order of drawings do matter because, marbles
        must always be atop everything else*/

    // Draw thr ring labels
    for (let i = 0; i < ring_labels.length; ++i) {
        textSize(22);
        fill(200);
        text(ring_labels[i][2], ring_labels[i][0], ring_labels[i][1]);

    }

    // Analyse the removable rings
    set_removable_rings();

    // Draw rings
    for (let i = 0; i < rings.length; ++i) {
        for (let j = 0; j < rings[i].length; ++j) {
            if (rings[i][j] != null) {
                rings[i][j].draw();
            }
        }
    }

    // Draw the player marble positions
    for (var key in player1_marbles_pos) {
        for (let i = 0; i < player1_marbles_pos[key]['posx'].length; ++i) {
            noStroke();
            fill(BGN_COLOUR + 50);
            circle(player1_marbles_pos[key]['posx'][i], player1_marbles_pos[key]['posy'], MARBLE_RADIUS);
            fill(BGN_COLOUR + 100);
            circle(player1_marbles_pos[key]['posx'][i] + 6, player1_marbles_pos[key]['posy'] + 6, 10);

            noStroke();
            fill(BGN_COLOUR + 50);
            circle(player2_marbles_pos[key]['posx'][i], player2_marbles_pos[key]['posy'], MARBLE_RADIUS);
            fill(BGN_COLOUR + 100);
            circle(player2_marbles_pos[key]['posx'][i] + 6, player2_marbles_pos[key]['posy'] + 6, 10);
        }
    }

    // Draw the marbles las it it must be atop evrything else.
    for (let i = 0; i < marbles.length; ++i) {
        marbles[i].draw();
    }

}

function mousePressed() {
    // Select the marble if clicked
    for (let i = 0; i < marbles.length; ++i) {
        if (marbles[i].clicked()) {
            return;
        }
    }

    // Remove the ring if clicked
    for (let i = 0; i < rings.length; ++i) {
        for (let j = 0; j < rings[i].length; ++j) {
            if (rings[i][j] != null) {
                if (rings[i][j].clicked()) {
                    rings[i][j] = null;
                    // Update board state
                    update_board_state();
                    return;
                }
            }
        }
    }
}

function mouseDragged() {
    // Drag the cliked marble
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
                for (let k = 0; k < rings[j].length; ++k) {
                    if (rings[j][k] != null) {
                        var d = dist(mouseX, mouseY, rings[j][k].posx, rings[j][k].posy);
                        /* check whether the mouse is inside the ring and if the
                        ring is empty */
                        if (d < 32.5 && !rings[j][k].has_marble) {
                            marbles[i].posx = rings[j][k].posx;
                            marbles[i].posy = rings[j][k].posy;

                            /* make the marble stick to its ring unless
                            moved to another ring*/
                            marbles[i].init_posx = marbles[i].posx;
                            marbles[i].init_posy = marbles[i].posy;

                            marbles[i].on_ring = true;

                            // update the ring if the marble has changed the rings
                            if (rings[j][k].id != marbles[i].ring_id && marbles[i].ring_id != null) {

                                /* we do this way, because the index of the rings
                                keep changin as and when the rings get removed*/
                                for (let n = 0; n < rings.length; ++n) {
                                    for (let m = 0; m < rings[n].length; ++m) {
                                        if (rings[n][m] != null && rings[n][m].id == marbles[i].ring_id) {
                                            rings[n][m].update_has_marble(false);
                                            break;
                                        }
                                    }
                                }
                            }

                            marbles[i].ring_id = rings[j][k].id;
                            marble_on_ring = true; // flag to check a marble has been placed on a ring
                            rings[j][k].update_has_marble(true);

                            // Update board state
                            update_board_state();
                            break;
                        }
                        marbles[i].lock = false;
                    }
                }
            }
            /* if the dragged marble is not moved to another
            ring, reset it to its previous position*/
            if (!marble_on_ring) {
                marbles[i].posx = marbles[i].init_posx;
                marbles[i].posy = marbles[i].init_posy;
            }
        }
    }

}

function set_removable_rings() {
    for (let i = 0; i < rings.length; ++i) {
        for (let j = 0; j < rings[i].length; ++j) {
            if (rings[i][j] != null) {

                if (rings[i][j].has_marble) {
                    rings[i][j].removable = false;
                }
                /*The idea behind selecting the removable
                rings is as follows -
                            0
                         0     0
                            0
                         0     0
                            0
                Every ring (centre) is surrounded by 6 positions.
                If the position is vacant, then it is replace with null
                else, it has a ring. From the above figure, the central
                ring is removable if and only if at least two adjacent 
                postions around it are vacant/null except for the top
                right pair. This is because the way the rings are 
                represented in the matrix are slightly diffrent from
                the rendering. (see rings matrix in the console).*/
                else if ((rings[i - 1][j] == null && rings[i - 1][j - 1] == null) ||
                    (rings[i - 1][j - 1] == null && rings[i][j - 1] == null) ||
                    (rings[i][j - 1] == null && rings[i + 1][j] == null) ||
                    (rings[i + 1][j] == null && rings[i][j + 1] == null) ||
                    (rings[i][j + 1] == null && rings[i - 1][j + 1] == null) ||
                    (rings[i - 1][j + 1] == null && rings[i - 1][j] == null))
                    rings[i][j].removable = true;
            }
        }
    }
}

function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function undo_move() {
    if (currState > 0) {
        rings = board_state['rings'][currState - 1];
        marbles = board_state['marbles'][currState - 1];
        currState--;
    }

}

function update_board_state() {

    // Clone the rings and marble positions at each state
    var temp_ring = [];
    for (let i = 0; i < rings.length; ++i) {
        temp_ring[i] = rings[i].slice(0);
    }
    board_state['rings'].push(temp_ring);

    var temp_arr = Array.from(marbles);
    // for (let i = 0; i < marbles.length; ++i) {
    //     temp_arr[i] = marbles[i];
    // }
    board_state['marbles'].push(temp_arr);
    currState++;

}