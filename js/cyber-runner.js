const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const groundY = 250;

const keys = {};
let player, obstacles, coinsList, speed, score, coins, frame, over, spawnTimer, coinTimer;

function reset() {
    player = { x: 80, y: groundY - 40, w: 30, h: 40, vy: 0, onGround: true };
    obstacles = [];
    coinsList = [];
    speed = 5;
    score = 0;
    coins = 0;
    frame = 0;
    over = false;
    spawnTimer = 60;
    coinTimer = 90;
}

function jump() {
    if (player.onGround && !over) {
        player.vy = -12;
        player.onGround = false;
    }
}

window.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if ([" ", "arrowleft", "arrowright", "arrowup"].includes(k)) e.preventDefault();
    if (k === " " || k === "arrowup" || k === "w") jump();
});
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
document.getElementById("restart").addEventListener("click", reset);

function update() {
    if (over) return;
    frame++;
    speed = Math.min(12, 5 + frame / 600);
    score += speed / 20;

    // left / right
    if (keys["a"] || keys["arrowleft"]) player.x -= 4;
    if (keys["d"] || keys["arrowright"]) player.x += 4;
    player.x = Math.max(20, Math.min(350, player.x));

    // jump physics
    player.vy += 0.6;
    player.y += player.vy;
    if (player.y >= groundY - player.h) {
        player.y = groundY - player.h;
        player.vy = 0;
        player.onGround = true;
    }

    // spawn obstacles
    if (--spawnTimer <= 0) {
        obstacles.push({ x: W, w: 20 + Math.random() * 20, h: 30 + Math.random() * 30 });
        spawnTimer = (60 + Math.random() * 50) * (6 / speed);
    }
    // spawn coins
    if (--coinTimer <= 0) {
        coinsList.push({ x: W, y: groundY - 30 - Math.random() * 80, r: 10 });
        coinTimer = 70 + Math.random() * 60;
    }

    obstacles.forEach(o => { o.x -= speed; });
    coinsList.forEach(c => { c.x -= speed; });
    obstacles = obstacles.filter(o => o.x + o.w > 0);

    // collisions
    obstacles.forEach(o => {
        const oy = groundY - o.h;
        if (player.x + 4 < o.x + o.w && player.x + player.w - 4 > o.x &&
            player.y + 4 < groundY && player.y + player.h > oy + 2) {
            over = true;
        }
    });

    coinsList.forEach(c => {
        if (player.x < c.x + c.r && player.x + player.w > c.x - c.r &&
            player.y < c.y + c.r && player.y + player.h > c.y - c.r) {
            c.taken = true;
            coins++;
            score += 20;
        }
    });
    coinsList = coinsList.filter(c => !c.taken && c.x + c.r > 0);
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    // ground
    ctx.fillStyle = "#e4e8f3";
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = "#a8c8ff";
    ctx.fillRect(0, groundY, W, 3);

    // obstacles
    ctx.fillStyle = "#b79cff";
    obstacles.forEach(o => { ctx.fillRect(o.x, groundY - o.h, o.w, o.h); });

    // coins
    ctx.fillStyle = "#f5c542";
    coinsList.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // player
    ctx.fillStyle = "#6f9bff";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x + 18, player.y + 8, 8, 8);

    document.getElementById("score").textContent = Math.floor(score);
    document.getElementById("coins").textContent = coins;
    document.getElementById("speed").textContent = speed.toFixed(1);

    if (over) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#2b2f3a";
        ctx.textAlign = "center";
        ctx.font = "bold 36px Segoe UI";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 5);
        ctx.font = "20px Segoe UI";
        ctx.fillText("Score " + Math.floor(score), W / 2, H / 2 + 30);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

reset();
loop();