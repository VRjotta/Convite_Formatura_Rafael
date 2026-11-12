/* Dino formando: espaço/seta ↑/toque para pular */
(function () {
  var cv = document.getElementById("game"), hint = document.getElementById("hint");
  if (!cv) return;
  var W = window.innerWidth < 760 ? 380 : 600, H = 150, GY = 138, S = (window.ASSETS || "") + "img/";
  cv.width = W * 2; cv.height = H * 2; cv.style.aspectRatio = W + " / " + H;
  var ctx = cv.getContext("2d");
  var dino = new Image(), sc = new Image(), loaded = 0;
  dino.onload = sc.onload = function () { if (++loaded === 2) draw(); };
  dino.src = S + "dino-sprite.png"; sc.src = S + "cenario.png";
  var CACT = [[228, 17, 35], [228, 34, 35], [228, 51, 35], [332, 25, 50], [332, 50, 50], [332, 75, 50]];
  var st = "idle", y = 0, vy = 0, speed = 6, dist = 0, score = 0, hi = 0, obs = [], clouds = [], next = 0, tick = 0, last = 0, deadAt = 0, raf = 0;
  function reset() { y = 0; vy = 0; speed = 6; dist = 0; score = 0; obs = []; next = 380; clouds = [{ x: 420, y: 28 }, { x: 150, y: 52 }]; }
  function jump() {
    if (st === "idle" || (st === "over" && performance.now() - deadAt > 350)) { reset(); st = "run"; last = performance.now(); hint.textContent = "Pule os cactos!"; loop(last); }
    else if (st === "run" && y === 0) vy = 10.4;
  }
  function pad(n) { return ("0000" + n).slice(-5); }
  function step(dt) {
    dist += speed * dt; speed = Math.min(13, speed + 0.0025 * dt); score = Math.floor(dist * 0.025);
    vy -= 0.6 * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = 0;
    next -= speed * dt;
    if (next <= 0) { var t = CACT[Math.floor(Math.random() * 6)]; obs.push({ x: W + 10, t: t }); next = (1 + Math.random() * 0.8) * Math.max(270, speed * 34) + t[1]; }
    obs.forEach(function (o) { o.x -= speed * dt; }); obs = obs.filter(function (o) { return o.x > -80; });
    clouds.forEach(function (c) { c.x -= 0.4 * dt; if (c.x < -50) { c.x = W + 20; c.y = 20 + Math.random() * 45; } });
    var dx = 10, dw = 26, dTop = GY - y - 50, dBot = GY - y;
    for (var i = 0; i < obs.length; i++) { var o = obs[i], ox = o.x + 3, ow = o.t[1] - 6, oTop = GY - o.t[2] + 3;
      if (dx + dw > ox && dx < ox + ow && dBot > oTop && dTop < GY) { die(); return; } }
  }
  function die() { st = "over"; deadAt = performance.now(); hi = Math.max(hi, score); hint.textContent = "Fim de jogo. Toque ou aperte espaço para jogar de novo."; }
  function draw() {
    ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, W, H);
    clouds.forEach(function (c) { ctx.drawImage(sc, 86, 2, 46, 14, c.x, c.y, 46, 14); });
    var off = (dist % 1200); ctx.drawImage(sc, 2 + 0, 54, 1200, 12, -off, GY - 10, 1200, 12); ctx.drawImage(sc, 2, 54, 1200, 12, 1200 - off, GY - 10, 1200, 12);
    obs.forEach(function (o) { var t = o.t; ctx.drawImage(sc, t[0], 2, t[1], t[2], o.x, GY - t[2] + 2, t[1], t[2]); });
    var f = st === "idle" ? 0 : st === "over" ? 5 : (y > 0 ? 0 : 2 + (Math.floor(dist / 55) % 2));
    ctx.drawImage(dino, f * 44, 0, 44, 56, 0, GY - y - 54, 44, 56);
    ctx.fillStyle = "#535353"; ctx.font = "bold 14px 'Courier New',monospace"; ctx.textAlign = "right";
    ctx.fillText((hi ? "HI " + pad(hi) + "  " : "") + pad(score), W - 8, 18);
    ctx.textAlign = "center";
    if (st === "idle") { ctx.font = "bold 22px 'Courier New',monospace"; ctx.fillText("FINALMENTE ACABOU!", W / 2, 62); ctx.font = "bold 12px 'Courier New',monospace"; ctx.fillText("TOQUE OU APERTE ESPAÇO PARA JOGAR", W / 2, 84); }
    if (st === "over") { ctx.font = "bold 22px 'Courier New',monospace"; ctx.fillText("FINALMENTE ACABOU!", W / 2, 58); ctx.drawImage(sc, 2, 2, 36, 32, W / 2 - 18, 70, 36, 32); }
  }
  function loop(now) {
    if (st !== "run") { draw(); return; }
    var dt = Math.min(2.5, (now - last) / 16.667); last = now; step(dt); draw(); raf = requestAnimationFrame(loop);
  }
  cv.addEventListener("pointerdown", function (e) { e.preventDefault(); cv.focus({ preventScroll: true }); jump(); });
  document.addEventListener("keydown", function (e) {
    var k = e.code === "Space" || e.code === "ArrowUp";
    if (k && (st === "run" || document.activeElement === cv)) { e.preventDefault(); if (!e.repeat) jump(); }
  });
  reset(); st = "idle"; draw();
})();
