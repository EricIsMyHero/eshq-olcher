const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 5;

// Ball settings
const BALL_RADIUS = 12;
const BALL_SPEED = 5;

// Player paddle (left)
let player = {
    x: 10,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#31c48d"
};

// AI paddle (right)
let ai = {
    x: WIDTH - PADDLE_WIDTH - 10,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#f43f5e"
};

// Ball
let ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1),
    radius: BALL_RADIUS,
    color: "#fee440"
};

function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff4";
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Net
    drawNet();

    // Paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    // Ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Mouse control - Player paddle
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
});

// AI control - simple tracking
function aiMove() {
    let target = ball.y - ai.height / 2;
    if (ai.y < target) {
        ai.y += PADDLE_SPEED;
        if (ai.y > target) ai.y = target;
    } else if (ai.y > target) {
        ai.y -= PADDLE_SPEED;
        if (ai.y < target) ai.y = target;
    }
    // Clamp
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

// Collision detection
function checkCollision(paddle) {
    // Closest point on paddle to ball
    let closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
    let closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
    let dx = ball.x - closestX;
    let dy = ball.y - closestY;

    return (dx * dx + dy * dy) <= (ball.radius * ball.radius);
}

function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom collision
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }
    if (ball.y + ball.radius > HEIGHT) {
        ball.y = HEIGHT - ball.radius;
        ball.vy *= -1;
    }

    // Paddle collisions
    if (checkCollision(player)) {
        ball.x = player.x + player.width + ball.radius;
        ball.vx *= -1;
        // Add a bit of randomness/angle
        ball.vy += (Math.random() - 0.5) * 2;
    }
    if (checkCollision(ai)) {
        ball.x = ai.x - ball.radius;
        ball.vx *= -1;
        // Add a bit of randomness/angle
        ball.vy += (Math.random() - 0.5) * 2;
    }

    // Score reset (ball out of bounds)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > WIDTH) {
        resetBall();
    }

    // AI movement
    aiMove();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start game
loop();