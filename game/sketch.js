var BGN_COLOUR = 51
let rings = [];
let marbles = [];

function setup() {
    // put setup code here
    createCanvas(1200, 800);
    background(BGN_COLOUR);

    // Setup the rings
    let posx = 200;
    let posy = 250;

    alph = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    num_rings = [4, 5, 6, 7, 6, 5, 4];
    for (let i = 0; i < alph.length; ++i) {
        posx += 64;
        posy = 250 - (num_rings[i] % 4) * 32;
        for (j = 0; j < num_rings[i]; ++j) {
            let ring = new Ring(posx, posy, alph[i].concat(String(j + 1)));
            rings.push(ring);
            posy += 66;
        }
    }

    posx = 820;
    posy = 100;
    num_marbles = [10, 8, 6];
    c = ["C", "P", "Y"];
    for (let i = 0; i < c.length; ++i) {
        posx += 66;
        posy = 100 + i * 52;
        for (j = 0; j < num_marbles[i]; ++j) {
            let marble = new Marble(posx, posy, c[i]);
            marbles.push(marble);
            posy += 56;
        }
    }

    // var b = new Marble(820, 180, "C");
    // marbles.push(b);

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
}

function mousePressed() {
    for (let i = 0; i < marbles.length; ++i) {
        if (marbles[i].clicked()) { return; }
    }

    let ring_remove_id;
    for (let i = 0; i < rings.length; ++i) {
        if (rings[i].clicked())
            ring_remove_id = i;
    }
    if (ring_remove_id) {
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
    for (let i = 0; i < marbles.length; ++i) {
        for (let j = 0; j < rings.length; ++j) {
            var d = dist(marbles[i].posx, marbles[i].posy, rings[j].posx, rings[j].posy);
            if (d < 32.5) {
                marbles[i].posx = rings[j].posx;
                marbles[i].posy = rings[j].posy;
                // rings[j].update_has_marble(true);
            }
            marbles[i].lock = false;
        }
    }

}