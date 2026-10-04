const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const keys = {};
let mouse = { x: W / 2, y: H / 2 };
let mouseDown = false;
let player, bullets, enemies, health, score, kills, zone, frame, cooldown, over;

function reset() {
    player = { x: W / 2, y: H / 2, r: 12, speed: 3 };
    bullets = [];
    enemies = [];
    health = 100;
    score = 0;
    kills = 0;
    zone = { x: W / 2, y: H / 2, r: 360 };
    frame = 0;
    cooldown = 0;
    over = false;
}

window.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
});
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (W / rect.width);
    mouse.y = (e.clientY - rect.top) * (H / rect.height);
});
canvas.addEventListener("mousedown", () => { mouseDown = true; });
window.addEventListener("mouseup", () => { mouseDown = false; });
document.getElementById("restart").addEventListener("click", reset);

function shoot() {
    const a = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bullets.push({ x: player.x, y: player.y, vx: Math.cos(a) * 8, vy: Math.sin(a) * 8 });
}

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * W; y = -15; }
    else if (side === 1) { x = W + 15; y = Math.random() * H; }
    else if (side === 2) { x = Math.random() * W; y = H + 15; }
    else { x = -15; y = Math.random() * H; }
    enemies.push({ x, y, r: 12, hp: 2, speed: 0.8 + Math.random() * 0.8 + frame / 6000 });
}

function update() {
    if (over) return;
    frame++;

    let dx = 0, dy = 0;
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;
    if (dx || dy) {
        const len = Math.hypot(dx, dy);
        player.x += (dx / len) * player.speed;
        player.y += (dy / len) * player.speed;
    }
    player.x = Math.max(player.r, Math.min(W - player.r, player.x));
    player.y = Math.max(player.r, Math.min(H - player.r, player.y));

    cooldown--;
    if ((mouseDown || keys[" "]) && cooldown <= 0) { shoot(); cooldown = 12; }

    const interval = Math.max(25, 90 - Math.floor(frame / 300) * 5);
    if (frame % interval === 0) spawnEnemy();

    bullets.forEach(b => { b.x += b.vx; b.y += b.vy; });
    bullets = bullets.filter(b => b.x > 0 && b.x < W && b.y > 0 && b.y < H);

    enemies.forEach(en => {
        const a = Math.atan2(player.y - en.y, player.x - en.x);
        en.x += Math.cos(a) * en.speed;
        en.y += Math.sin(a) * en.speed;
        if (Math.hypot(player.x - en.x, player.y - en.y) < player.r + en.r) health -= 0.4;
    });

    bullets.forEach(b => {
        enemies.forEach(en => {
            if (!b.dead && !en.dead && Math.hypot(b.x - en.x, b.y - en.y) < en.r + 3) {
                b.dead = true;
                en.hp--;
                if (en.hp <= 0) { en.dead = true; kills++; score += 10; }
            }
        });
    });
    bullets = bullets.filter(b => !b.dead);
    enemies = enemies.filter(e => !e.dead);

    if (zone.r > 90) zone.r -= 0.08;
    if (Math.hypot(player.x - zone.x, player.y - zone.y) > zone.r) health -= 0.1;

    if (frame % 60 === 0) score += 1;
    if (health <= 0) { health = 0; over = true; }
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    // danger area outside the safe zone
    ctx.fillStyle = "rgba(201, 182, 255, 0.35)";
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.arc(zone.x, zone.y, zone.r, 0, Math.PI * 2);
    ctx.fill("evenodd");
    ctx.strokeStyle = "#a8c8ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.r, 0, Math.PI * 2);
    ctx.stroke();

    // bullets
    ctx.fillStyle = "#7a6ff0";
    bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill(); });

    // enemies
    ctx.fillStyle = "#e58fa0";
    enemies.forEach(en => { ctx.beginPath(); ctx.arc(en.x, en.y, en.r, 0, Math.PI * 2); ctx.fill(); });

    // player + aim line
    ctx.fillStyle = "#6f9bff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
    const a = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    ctx.strokeStyle = "#2b2f3a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + Math.cos(a) * 22, player.y + Math.sin(a) * 22);
    ctx.stroke();

    document.getElementById("health").textContent = Math.ceil(health);
    document.getElementById("score").textContent = score;
    document.getElementById("kills").textContent = kills;

    if (over) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#2b2f3a";
        ctx.textAlign = "center";
        ctx.font = "bold 40px Segoe UI";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 10);
        ctx.font = "20px Segoe UI";
        ctx.fillText("Score " + score + "  •  Kills " + kills, W / 2, H / 2 + 28);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

reset();
loop();