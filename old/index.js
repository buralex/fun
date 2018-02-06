
const game = (fld, pF, px, py, dx, dy, lifes, score) => {
    const cycle = setInterval(() => {
        // ball position
        console.log(fld);
        console.log(ball.style.left);
        const bx = pF(ball.style.left = `${pF(ball.style.left) + dx}px`);
        console.log(bx);
        const by = pF(ball.style.top = `${pF(ball.style.top) + dy}px`);

        const row = ((by - 30) / 14) | 0;
        console.log(row); //debugger
        const col = (bx / 32) | 0;

        // bounce from left or right wall
        if (bx < 0 && dx < 0 || bx >= 314 && dx > 0) {dx *= -1;}

        // bounce from paddle
        if (bx + 6 >= px && bx + 6 <= px + 64 && by >= 259 && by <= 264) {
            dy *= -1;
            if (bx + 6 <= px + 21) dx = -6;
            else if (bx + 6 >= px + 43) dx = 6;
            else if (Math.abs(dx) === 6) dx = (dx * 2 / 3) | 0;
        }

        // bounce from top
        if (by < 0) {dy *= -1;}

        // bounce from bottom and game over
        if (by >= 288 && !--lifes) {
            clearInterval(cycle);
            alert('Game over!');
        }

        // bounce from bottom
        if (by >= 288 && lifes) {dy *= -1;}
        lifesNode.innerHTML = lifes;



        // removing bricks
        if (by >= 18 && by <= 100 && fld[row * 10 + col].className !== 'removed') {

            console.log(fld[row * 10 + col]);
            console.log(col);
            console.log(row);
            console.log(row * 10 + col);
            //debugger

            dy *= -1;

            fld[row * 10 + col].className = 'removed';

            if (dx < 0 && ((bx | 0) % 32 < 10 || (bx | 0) % 32 > 22)) {dx *= -1;}
            if (dx > 0 && (((bx + 12) | 0) % 32 < 10 || ((bx + 12) | 0) % 32 > 22)) {dx *= -1;}
            scoreNode.innerHTML = ++score;
            if (score === 50) {
                clearInterval(cycle);
                alert('Victory!');
            }
        }
    }, 1000/60);

    document.addEventListener('mousemove', (e) => {
        px = (e.pageX > 40) ? ((e.pageX < 290) ? e.pageX - 40 : 256) : 0;
        paddle.style.left = px + 'px';
    }, false);
};

// initial css values (px)
const px = 128; // left: 128
const py = 270; // top: 270

// offset ball per cycle (px)
const dx = -4;
const dy = -4;

const lifes = 100;
const score = 0;

game(field.children, parseFloat, px, py, dx, dy, lifes, score);
