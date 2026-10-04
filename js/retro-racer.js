const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const laneX = [100, 200, 300];
const CAR_W = 40, CAR_H = 70;

let lane, speed, score, coins, items, frame, over, offset;

function reset() {
    lane = 1;
    speed = 4;
    score = 0;
    coins = 0;
    items = [];
    frame = 0;
    over = false;
    offset = 0;
}

window.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    if (["arrowleft", "arrowright"].includes(k)) e.preventDefault();
    if (over) return;
    if (k === "arrowleft" || k === "a") lane = Math.max(0, lane - 1);
    if (k === "arrowright" || k === "d") lane = Math.min(2, lane + 1);
});
document.getElementById("restart").addEventListener("click", reset);

function update() {
    if (over) return;
    frame++;
    speed = Math.min(14, speed + 0.003);
    offset = (offset + speed) % 40;
    score += speed / 10;

    if (frame % Math.max(25, Math.floor(80 - speed * 4)) === 0) {
        items.push({
            lane: Math.floor(Math.random() * 3),
            y: -80,
            type: Math.random() < 0.7 ? "car" : "coin"
        });
    }

    items.forEach(it => { it.y += speed; });
    items = items.filter(it => it.y < H + 80);

    const px = laneX[lane] - CAR_W / 2;
    const py = H - 110;

    items.forEach(it => {
        const ix = laneX[it.lane];
        if (it.type === "car") {
            const hit = px < ix + CAR_W / 2 && px + CAR_W > ix - CAR_W / 2 &&
                        py < it.y + CAR_H && py + CAR_H > it.y;
            if (hit) over = true;
        } else if (!it.taken) {
            const cy = it.y + CAR_H / 2;
            const hit = px < ix + 12 && px + CAR_W > ix - 12 &&
                        py < cy + 12 && py + CAR_H > cy - 12;
            if (hit) { it.taken = true; coins++; score += 50; }
        }
    });
    items = items.filter(it => !it.taken);
}

function drawCar(cx, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - CAR_W / 2, y, CAR_W, CAR_H);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(cx - CAR_W / 2 + 6, y + 14, CAR_W - 12, 14);
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    // road
    ctx.fillStyle = "#e4e8f3";
    ctx.fillRect(50, 0, 300, H);
    ctx.fillStyle = "#a8c8ff";
    ctx.fillRect(46, 0, 4, H);
    ctx.fillRect(350, 0, 4, H);
    ctx.fillStyle = "#ffffff";
    for (let y = -40 + offset; y < H; y += 40) {
        ctx.fillRect(148, y, 4, 20);
        ctx.fillRect(248, y, 4, 20);
    }

    // items
    items.forEach(it => {
        const ix = laneX[it.lane];
        if (it.type === "car") {
            drawCar(ix, it.y, "#b79cff");
        } else {
            ctx.fillStyle = "#f5c542";
            ctx.beginPath();
            ctx.arc(ix, it.y + CAR_H / 2, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    drawCar(laneX[lane], H - 110, "#6f9bff");

    document.getElementById("score").textContent = Math.floor(score);
    document.getElementById("coins").textContent = coins;
    document.getElementById("speed").textContent = speed.toFixed(1);

    if (over) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#2b2f3a";
        ctx.textAlign = "center";
        ctx.font = "bold 36px Segoe UI";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 10);
        ctx.font = "20px Segoe UI";
        ctx.fillText("Score " + Math.floor(score), W / 2, H / 2 + 28);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

reset();
loop();