(function() {
  const modal = document.getElementById('snake-modal');
  const canvas = document.getElementById('snake-canvas');
  const closeBtn = document.getElementById('snake-close');
  const controls = document.querySelectorAll('.snake-btn');
  const logo = document.querySelector('.logo');
  const restartBtn = document.getElementById('snake-restart');
  let ctx, interval, snake, dir, food, score, gameOver, pendingDir;
  const size = 16, grid = 20;

  function resetGame() {
    snake = [{x: 10, y: 10}];
    dir = {x: 1, y: 0};
    pendingDir = null;
    food = {x: Math.floor(Math.random()*grid), y: Math.floor(Math.random()*grid)};
    score = 0;
    gameOver = false;
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw food
    ctx.fillStyle = '#DB6832';
    ctx.beginPath();
    ctx.arc((food.x+0.5)*size, (food.y+0.5)*size, size/2.2, 0, 2*Math.PI);
    ctx.fill();
    // Draw snake
    for (let i=0; i<snake.length; ++i) {
      ctx.fillStyle = i === 0 ? '#fff' : '#DB6832';
      ctx.fillRect(snake[i].x*size, snake[i].y*size, size, size);
    }
    // Game over
    if (gameOver) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width/2, canvas.height/2-10);
      ctx.font = '16px sans-serif';
      ctx.fillText('Score: '+score, canvas.width/2, canvas.height/2+18);
      ctx.fillText('Press ESC or Close', canvas.width/2, canvas.height/2+38);
      restartBtn.style.display = 'block';
    } else {
      restartBtn.style.display = 'none';
    }
  }

  function move() {
    if (pendingDir) { dir = pendingDir; pendingDir = null; }
    const head = {x: snake[0].x+dir.x, y: snake[0].y+dir.y};
    // Wall or self collision
    if (head.x<0||head.x>=grid||head.y<0||head.y>=grid||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      gameOver = true; clearInterval(interval); draw(); return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      food = {x: Math.floor(Math.random()*grid), y: Math.floor(Math.random()*grid)};
    } else {
      snake.pop();
    }
    draw();
  }

  function setDir(newDir) {
    if (gameOver) return;
    // Prevent reverse
    if ((newDir.x === -dir.x && newDir.y === 0) || (newDir.y === -dir.y && newDir.x === 0)) return;
    pendingDir = newDir;
  }

  function startGame() {
    ctx = canvas.getContext('2d');
    resetGame();
    draw();
    interval = setInterval(move, 110);
    canvas.focus();
  }

  function openModal() {
    // Responsive canvas size
    if (window.innerWidth <= 600) {
      const size = Math.min(window.innerWidth * 0.9, 400);
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
    } else {
      canvas.width = 320;
      canvas.height = 320;
      canvas.style.width = '';
      canvas.style.height = '';
    }
    modal.style.display = 'flex';
    document.body.classList.add('no-scrollbar');
    startGame();
  }
  function closeModal() {
    modal.style.display = 'none';
    document.body.classList.remove('no-scrollbar');
    clearInterval(interval);
  }

  // Keyboard controls
  document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'flex') {
      if (e.key === 'ArrowUp') setDir({x:0,y:-1});
      if (e.key === 'ArrowDown') setDir({x:0,y:1});
      if (e.key === 'ArrowLeft') setDir({x:-1,y:0});
      if (e.key === 'ArrowRight') setDir({x:1,y:0});
      if (e.key === 'Escape') closeModal();
    }
  });
  // Mobile/touch controls
  controls.forEach(btn => {
    btn.addEventListener('click', function() {
      const d = this.dataset.dir;
      if (d==='up') setDir({x:0,y:-1});
      if (d==='down') setDir({x:0,y:1});
      if (d==='left') setDir({x:-1,y:0});
      if (d==='right') setDir({x:1,y:0});
    });
  });
  closeBtn.addEventListener('click', closeModal);

  // Secret trigger: type 'snake'
  let buffer = '';
  document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'flex') return;
    buffer += e.key.toLowerCase();
    if (buffer.length > 8) buffer = buffer.slice(-8);
    if (buffer.includes('snake')) {
      openModal();
      buffer = '';
    }
  });

  // Logo tap/click trigger (5x in 2s)
  if (logo) {
    let tapCount = 0;
    let tapTimer = null;
    logo.addEventListener('click', function() {
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => { tapCount = 0; }, 2000);
      }
      if (tapCount === 5) {
        clearTimeout(tapTimer);
        tapCount = 0;
        openModal();
      }
    });
  }

  restartBtn.addEventListener('click', function() {
    resetGame();
    draw();
    interval = setInterval(move, 110);
    restartBtn.style.display = 'none';
  });
})(); 