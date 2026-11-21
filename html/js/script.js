let configMain = null;
let configHeader = null;
let configFooter = null;
let configServerInfo = null;
let configSidemenuList = null;
let configProfile = null;
let configPartners = null;

let activeCategory = 'all';
let telemetryTimer = null;
let radioIntervalId = null;

// ===== 隠しテーマ (コマンドパレット) =====
// パレットで "blue-archive" など (下のエイリアス表記ゆれ込み) と入力すると青基調テーマに切り替わる。
// テーマは localStorage に保存され、script.js を読む全ページで維持される。
const THEME_STORAGE_KEY = 'an-site-theme';
const THEME_BLUE_ARCHIVE = 'blue-archive';
// コマンドの表記ゆれ吸収: 空白・ハイフン・アンダースコアを除去し小文字化してから照合する
function normalizeThemeCommand(q) {
    return (q || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
}
const THEME_COMMAND_ALIASES = ['bluearchive', 'ブルーアーカイブ', 'ブルアーカイブ', 'ブルアカ', 'ぶるあか'];
const THEME_RESET_ALIASES = ['reset', 'リセット', 'りせっと', 'default', 'もとに戻す'];

function applySiteTheme(theme) {
    if (!document.body) return;
    const isBlueArchive = theme === THEME_BLUE_ARCHIVE;
    document.body.classList.toggle('theme-blue-archive', isBlueArchive);
    document.documentElement.classList.toggle('theme-blue-archive', isBlueArchive);
    // ロゴ画像 (img.site-logo) はテーマに合わせて青版と通常版を切り替える
    document.querySelectorAll('img.site-logo').forEach(img => {
        if (!img.dataset.logoDefault) img.dataset.logoDefault = img.getAttribute('src');
        img.src = (isBlueArchive && img.dataset.logoBlue) ? img.dataset.logoBlue : img.dataset.logoDefault;
    });
    // ファビコン (link.site-favicon) もテーマに合わせて切り替える
    document.querySelectorAll('link.site-favicon').forEach(link => {
        if (!link.dataset.faviconDefault) link.dataset.faviconDefault = link.getAttribute('href');
        link.href = (isBlueArchive && link.dataset.faviconBlue) ? link.dataset.faviconBlue : link.dataset.faviconDefault;
    });
    updateWaterSurface(isBlueArchive);
}

// ===== blue-archive テーマ用: 水面 (WebGL コースティクス / Canvas フォールバック) =====
// テーマONのときだけ画面背面に固定Canvasを敷く。
// 本命は WebGL のコースティクス (プールの底のような光の網目) で、
// 解像度は端末の画素密度 (上限1.5倍) まで上げる。
// WebGL が使えない環境では Canvas 2D の簡易水面に落とす。
// どちらも約30fpsに制限し、タブが裏に回ったら描画を止める。
// prefers-reduced-motion では動かさない (style.css の静止グラデーションになる)。
let waterCanvas = null;
let waterMode = null; // 'gl' | '2d'
let waterGl = null;
let waterGlURes = null;
let waterGlUTime = null;
let waterCtx = null;
let waterRafId = null;
let waterLastDraw = 0;
let waterLastRaw = 0;
let waterElapsed = 0;
let waterScale = null; // GL描画の解像度倍率 (適応制御で下がることがある)
let waterFrameCount = 0;
let waterFrameTimeSum = 0;
let waterResizeTimer = null;
let waterFramesDrawn = 0; // 実描画したフレーム数 (診断用)
let waterMaxHeight = 0; // アドレスバーを除いた最大の高さ (バッファはこの高さで固定する)
let themeDesks = [];
let themeDesksWrap = null;
// 右下の木の机 (真上視点・椅子なし・天板はまっさら)。水面Canvasの上に重ねる固定レイヤー
const THEME_DESK_SVG = '<svg viewBox="0 0 300 240" width="100%" aria-hidden="true"><defs><linearGradient id="desk-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cf9550"/><stop offset="0.55" stop-color="#bb7f36"/><stop offset="1" stop-color="#a26a28"/></linearGradient><linearGradient id="desk-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.03"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient><radialGradient id="desk-knot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#6e4413" stop-opacity="0.85"/><stop offset="0.45" stop-color="#8a5a1d" stop-opacity="0.5"/><stop offset="1" stop-color="#8a5a1d" stop-opacity="0"/></radialGradient><filter id="desk-tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.22" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.23 0 0 0 0 0.13 0 0 0 0 0.02 0.9 0.9 0.9 0 -0.9"/></filter><filter id="desk-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6"/></filter><clipPath id="desk-clip"><rect x="40" y="40" width="196" height="128" rx="10"/></clipPath></defs><rect x="52" y="66" width="196" height="128" rx="12" fill="rgba(8,47,73,0.28)" filter="url(#desk-soft)"/><g fill="#ccd1d6" stroke="#8a9199" stroke-width="1.5"><circle cx="44" cy="44" r="6"/><circle cx="232" cy="44" r="6"/><circle cx="44" cy="164" r="6"/><circle cx="232" cy="164" r="6"/></g><rect x="40" y="40" width="196" height="128" rx="10" fill="url(#desk-wood)"/><g clip-path="url(#desk-clip)"><rect x="40" y="40" width="196" height="128" filter="url(#desk-tex)" opacity="0.55"/><ellipse cx="88" cy="98" rx="17" ry="8" fill="url(#desk-knot)"/><ellipse cx="196" cy="66" rx="12" ry="6" fill="url(#desk-knot)" opacity="0.7"/><ellipse cx="150" cy="140" rx="13" ry="6" fill="url(#desk-knot)" opacity="0.55"/><path d="M40 92 C 100 84, 170 100, 236 90" stroke="rgba(255,235,200,0.20)" stroke-width="5" fill="none"/><rect x="40" y="40" width="196" height="128" fill="url(#desk-sheen)"/></g><rect x="40" y="40" width="196" height="128" rx="10" fill="none" stroke="rgba(80,45,8,0.55)" stroke-width="2.5"/><rect x="50" y="50" width="176" height="108" rx="7" fill="none" stroke="rgba(80,45,8,0.22)" stroke-width="2"/></svg>';

function ensureThemeDesks() {
    if (themeDesks.length) return;
    // 机は 100lvh の固定ラッパーの中に入れる。ラッパーの箱はアドレスバーで
    // 変形しないので、机の位置が上下に動かなくなる (水面Canvasと同じ対策)
    const wrap = document.createElement('div');
    wrap.id = 'theme-desks';
    wrap.style.display = 'none';
    for (let i = 1; i <= 3; i++) {
        const d = document.createElement('div');
        d.className = 'theme-desk theme-desk-' + i;
        d.innerHTML = THEME_DESK_SVG;
        wrap.appendChild(d);
        themeDesks.push(d);
    }
    document.body.appendChild(wrap);
    themeDesksWrap = wrap;
}
let waterBlobs = [];

const WATER_VERTEX_SHADER = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
const WATER_FRAGMENT_SHADER = [
    'precision highp float;',
    'uniform vec2 u_res; uniform float u_time;',
    'float caust(vec2 uv, float time){',
    '  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;',
    '  vec2 i = vec2(p);',
    '  float c = 1.0;',
    '  float inten = 0.005;',
    '  for (int n = 0; n < 5; n++) {',
    '    float t = time * (1.0 - (3.5 / float(n + 1)));',
    '    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));',
    '    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));',
    '  }',
    '  c /= 5.0; c = 1.17 - pow(c, 1.4);',
    '  return pow(abs(c), 8.0);',
    '}',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'void main(){',
    '  float gradY = gl_FragCoord.y / u_res.y;',
    '  vec2 cuv = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_res.x * 1.35;',
    '  float t = u_time * 0.45;',
    '  float c1 = caust(cuv, t);',
    '  float c2 = caust(cuv * 1.7 + 3.1, t * 1.3);',
    '  vec3 deep = mix(vec3(0.45, 0.76, 0.94), vec3(0.58, 0.84, 0.97), gradY);',
    '  vec3 col = deep;',
    '  float floorAmt = pow(1.0 - gradY, 1.3);',
    '  vec3 tileBase = mix(vec3(0.60, 0.65, 0.60), vec3(0.70, 0.74, 0.68), gradY);',
    '  col = mix(deep, tileBase, floorAmt * 0.50);',
    '  float ts = 0.34;',
    '  vec2 tp = cuv / ts;',
    '  vec2 tf = fract(tp);',
    '  vec2 tid = floor(tp);',
    '  float rot = mod(tid.x + tid.y, 2.0);',
    '  vec2 bp = tf * 2.0;',
    '  vec2 bid = floor(bp);',
    '  vec2 bl = fract(bp);',
    '  float vert = mod(bid.x + bid.y + rot, 2.0);',
    '  float gcoord = mix(bl.y, bl.x, vert);',
    '  float grain = 0.95 + 0.05 * sin(gcoord * 26.0 + hash(tid * 3.0 + bid) * 20.0);',
    '  float boardTone = 0.93 + hash(tid * 7.0 + bid * 13.0) * 0.11;',
    '  float bseamX = smoothstep(0.0, 0.05, bl.x) * smoothstep(1.0, 0.95, bl.x);',
    '  float bseamY = smoothstep(0.0, 0.05, bl.y) * smoothstep(1.0, 0.95, bl.y);',
    '  float bseam = mix(0.88, 1.0, bseamX * bseamY);',
    '  float seamX = smoothstep(0.0, 0.03, tf.x) * smoothstep(1.0, 0.97, tf.x);',
    '  float seamY = smoothstep(0.0, 0.03, tf.y) * smoothstep(1.0, 0.97, tf.y);',
    '  float tseam = mix(0.78, 1.0, seamX * seamY);',
    '  col *= mix(1.0, grain * boardTone * bseam * tseam, floorAmt * 0.95);',
    '  col += vec3(0.55, 0.92, 1.0) * c1 * 0.20;',
    '  col += vec3(0.80, 0.98, 1.0) * c2 * 0.11;',
    '  col += vec3(1.0) * pow(c1, 3.0) * 0.05;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
].join('\n');

function initWaterGL(canvas) {
    try {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return false;
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
        };
        const vs = compile(gl.VERTEX_SHADER, WATER_VERTEX_SHADER);
        const fs = compile(gl.FRAGMENT_SHADER, WATER_FRAGMENT_SHADER);
        if (!vs || !fs) return false;
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        waterGlURes = gl.getUniformLocation(prog, 'u_res');
        waterGlUTime = gl.getUniformLocation(prog, 'u_time');
        waterGl = gl;
        return true;
    } catch (e) {
        return false;
    }
}

function makeWaterCanvasElement() {
    const c = document.createElement('canvas');
    c.id = 'theme-water-canvas';
    c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100lvh;z-index:-1;pointer-events:none;';
    return c;
}

function ensureWaterCanvas() {
    if (waterCanvas) return;
    waterCanvas = makeWaterCanvasElement();
    document.body.appendChild(waterCanvas);
    if (initWaterGL(waterCanvas)) {
        waterMode = 'gl';
    } else {
        // WebGL の取得に失敗した Canvas では 2D が取れないため作り直す
        const fresh = makeWaterCanvasElement();
        waterCanvas.replaceWith(fresh);
        waterCanvas = fresh;
        waterCtx = waterCanvas.getContext('2d');
        waterMode = '2d';
        waterBlobs = [];
        for (let i = 0; i < 16; i++) {
            waterBlobs.push({
                x: Math.random(), y: Math.random(),
                r: 70 + Math.random() * 160,
                speed: 0.10 + Math.random() * 0.20,
                phase: Math.random() * Math.PI * 2,
                drift: 0.02 + Math.random() * 0.04
            });
        }
    }
    resizeWaterCanvas();
    window.addEventListener('resize', scheduleWaterResize);
}

// スクロール中のアドレスバー出入りで resize が連発すると、そのたびに
// 描画バッファが再確保+クリアされて「最初から再生」したように見える。
// イベントが止んでから1回だけ作り直す (その間はCSS側の伸縮で吸収される)
function scheduleWaterResize() {
    if (waterResizeTimer) clearTimeout(waterResizeTimer);
    waterResizeTimer = setTimeout(resizeWaterCanvas, 250);
}

function resizeWaterCanvas() {
    if (!waterCanvas) return;
    // バッファの高さは「今までで最大の viewport 高さ」で固定する。
    // アドレスバーの出入りでは innerHeight が上下するが、それでバッファを
    // 作り直すとクリア+再配置で「最初から再生」に見えるため、幅が変わるか
    // 高さの最大値が更新されたときだけ作り直す (値は変わらない場合は代入もしない)
    waterMaxHeight = Math.max(waterMaxHeight, window.innerHeight);
    // 要素の箱の高さも最大高さに固定する。追従させるとアドレスバーの出入りごとに
    // 水面全体が縦に伸縮し「場面が切り替わった」ように見えるため
    waterCanvas.style.height = waterMaxHeight + 'px';
    if (waterMode === 'gl') {
        if (waterScale === null) waterScale = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.max(2, Math.round(window.innerWidth * waterScale));
        const h = Math.max(2, Math.round(waterMaxHeight * waterScale));
        if (waterCanvas.width !== w || waterCanvas.height !== h) {
            waterCanvas.width = w;
            waterCanvas.height = h;
            if (waterGl) waterGl.viewport(0, 0, w, h);
        }
    } else {
        const w = Math.max(2, Math.round(window.innerWidth * 0.5));
        const h = Math.max(2, Math.round(waterMaxHeight * 0.5));
        if (waterCanvas.width !== w || waterCanvas.height !== h) {
            waterCanvas.width = w;
            waterCanvas.height = h;
        }
    }
}

function drawWaterGL(now) {
    if (!waterGl) return;
    waterGl.uniform2f(waterGlURes, waterCanvas.width, waterCanvas.height);
    waterGl.uniform1f(waterGlUTime, now / 1000);
    waterGl.drawArrays(waterGl.TRIANGLE_STRIP, 0, 4);
}

function drawWaterSurface(now) {
    if (!waterCtx || !waterCanvas) return;
    const w = waterCanvas.width;
    const h = waterCanvas.height;
    const t = now / 1000;

    // 水のグラデーション (GL版に寄せた濃い青: 上が明るく、下が深い)
    const g = waterCtx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0e7cc4');
    g.addColorStop(0.45, '#0369a1');
    g.addColorStop(1, '#075985');
    waterCtx.fillStyle = g;
    waterCtx.fillRect(0, 0, w, h);

    // 斜めに流れる光の帯 (2方向) で水面のゆらぎを出す
    waterCtx.save();
    waterCtx.globalCompositeOperation = 'lighter';
    for (let set = 0; set < 2; set++) {
        const angle = set === 0 ? 0.5 : -0.9;
        const spacing = 130 - set * 45;
        const speed = 14 + set * 9;
        waterCtx.save();
        waterCtx.translate(w / 2, h / 2);
        waterCtx.rotate(angle);
        const diag = Math.sqrt(w * w + h * h);
        const off = (t * speed) % spacing;
        for (let x = -diag + off; x < diag; x += spacing) {
            const lg = waterCtx.createLinearGradient(x, 0, x + 46, 0);
            lg.addColorStop(0, 'rgba(125, 211, 252, 0)');
            lg.addColorStop(0.5, 'rgba(125, 211, 252, 0.13)');
            lg.addColorStop(1, 'rgba(125, 211, 252, 0)');
            waterCtx.fillStyle = lg;
            waterCtx.fillRect(x, -diag, 46, diag * 2);
        }
        waterCtx.restore();
    }
    waterCtx.restore();

    // 光だまり: 明るい水色の光が漂いながら明滅する
    for (const b of waterBlobs) {
        const bx = (b.x + Math.sin(t * b.drift + b.phase) * 0.03) * w;
        const by = (b.y + Math.cos(t * b.drift * 0.8 + b.phase) * 0.03) * h;
        const pulse = 0.5 + 0.5 * Math.sin(t * b.speed * 2 + b.phase);
        const alpha = 0.08 + pulse * 0.12;
        const rg = waterCtx.createRadialGradient(bx, by, 0, bx, by, b.r);
        rg.addColorStop(0, 'rgba(186, 230, 253, ' + alpha + ')');
        rg.addColorStop(1, 'rgba(186, 230, 253, 0)');
        waterCtx.fillStyle = rg;
        waterCtx.beginPath();
        waterCtx.arc(bx, by, b.r, 0, Math.PI * 2);
        waterCtx.fill();
    }

    // ゆっくり横に流れる波の帯 (3層)
    for (let layer = 0; layer < 3; layer++) {
        const amp = 6 + layer * 5;
        const len = 0.008 - layer * 0.0018;
        const speed = 0.25 + layer * 0.12;
        const yBase = h * (0.25 + layer * 0.28);
        waterCtx.beginPath();
        waterCtx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
            const y = yBase + Math.sin(x * len + t * speed + layer * 2.1) * amp
                            + Math.sin(x * len * 2.7 - t * speed * 0.7) * amp * 0.4;
            waterCtx.lineTo(x, y);
        }
        waterCtx.lineTo(w, h);
        waterCtx.closePath();
        waterCtx.fillStyle = 'rgba(2, 60, 110, ' + (0.05 + layer * 0.02) + ')';
        waterCtx.fill();
    }
}

function waterLoop(now) {
    waterRafId = requestAnimationFrame(waterLoop);
    if (document.hidden) { waterLastRaw = now; return; }
    if (now - waterLastDraw < 33) return; // 約30fpsに制限
    // 時間は実時刻ではなくデルタ積算で進める (1回最大50ms)。
    // フレーム落ちした分だけ未来へジャンプするのを防ぎ、継ぎ目感を消す
    const delta = waterLastRaw ? Math.min(now - waterLastRaw, 50) : 16;
    waterLastRaw = now;
    waterElapsed += delta;
    waterLastDraw = now;

    // 適応解像度: 平均フレーム間隔が重い状態が続いたら一段下げる (GLのみ)
    if (waterMode === 'gl' && waterScale !== null) {
        waterFrameCount++;
        waterFrameTimeSum += delta;
        if (waterFrameCount >= 90) {
            const avg = waterFrameTimeSum / waterFrameCount;
            if (avg > 40 && waterScale > 0.6) {
                waterScale = Math.max(0.6, waterScale - 0.25);
                resizeWaterCanvas();
            }
            waterFrameCount = 0;
            waterFrameTimeSum = 0;
        }
    }

    waterFramesDrawn++;
    if (waterMode === 'gl') {
        drawWaterGL(waterElapsed);
    } else {
        drawWaterSurface(waterElapsed);
    }
}

// 診断オーバーレイ: URL に ?waterdebug=1 を付けたときだけ表示。
// setInterval で更新するので、rAF が止まっても数字の更新自体は続く。
// frames が止まれば rAF/描画側の問題、size が変わればバッファ再確保の問題と切り分けられる
function setupWaterDebug() {
    if (!/[?&]waterdebug=1/.test(location.search)) return;
    if (document.getElementById('water-debug')) return;
    const box = document.createElement('div');
    box.id = 'water-debug';
    box.style.cssText = 'position:fixed;top:64px;left:8px;z-index:9999;background:rgba(0,0,0,.78);color:#7dd3fc;font:11px/1.5 monospace;padding:6px 8px;border-radius:6px;pointer-events:none;white-space:pre;';
    document.body.appendChild(box);
    setInterval(() => {
        box.textContent =
            'mode: ' + waterMode + '\n' +
            't(s): ' + (waterElapsed / 1000).toFixed(1) + '\n' +
            'frames: ' + waterFramesDrawn + '\n' +
            'size: ' + (waterCanvas ? waterCanvas.width + 'x' + waterCanvas.height : '-') + '\n' +
            'inner: ' + window.innerWidth + 'x' + window.innerHeight + '\n' +
            'scale: ' + waterScale;
    }, 200);
}

function startWaterSurface() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.__waterMode = 'reduced-motion';
        return;
    }
    ensureWaterCanvas();
    if (!waterCanvas) return;
    window.__waterMode = waterMode;
    document.body.classList.add('water-active');
    waterCanvas.style.display = '';
    ensureThemeDesks();
    if (themeDesksWrap) themeDesksWrap.style.display = '';
    setupWaterDebug();
    if (waterRafId === null) {
        waterLastDraw = 0;
        waterLastRaw = 0;
        waterRafId = requestAnimationFrame(waterLoop);
    }
}

function stopWaterSurface() {
    window.__waterMode = 'off';
    if (themeDesksWrap) themeDesksWrap.style.display = 'none';
    if (document.body) document.body.classList.remove('water-active');
    if (waterRafId !== null) {
        cancelAnimationFrame(waterRafId);
        waterRafId = null;
    }
    if (waterCanvas) waterCanvas.style.display = 'none';
}

function updateWaterSurface(isBlueArchive) {
    if (isBlueArchive) {
        startWaterSurface();
    } else {
        stopWaterSurface();
    }
}


function setSiteTheme(theme) {
    if (theme) {
        try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) {}
    } else {
        try { localStorage.removeItem(THEME_STORAGE_KEY); } catch (e) {}
    }
    applySiteTheme(theme);
}

function getSiteTheme() {
    try { return localStorage.getItem(THEME_STORAGE_KEY); } catch (e) { return null; }
}

// script.js は </body> 直前で読まれるため、この時点で body に即時適用できる
applySiteTheme(getSiteTheme());

/**
 * SVGスプライト（/icons/sprites.svg#id）を参照するアイコン描画関数
 * 巨大なインラインSVG辞書を撤廃し、スプライト参照用 <use> タグを出力
 */
function renderIcon(iconStr, defaultClass = 'w-6 h-6 fill-current inline-block flex-shrink-0') {
    if (!iconStr) return '';

    // png, jpg, webp などの画像ファイル指定の場合は img タグを返す
    if ((iconStr.includes('/') || iconStr.includes('.')) && !iconStr.toLowerCase().endsWith('.svg')) {
        return `<img src="${iconStr}" alt="icon" loading="lazy" class="w-3.5 h-3.5 object-contain flex-shrink-0">`;
    }

    // IDの抽出 (例: "/icons/azuracast.svg" -> "azuracast", "azuracast.svg" -> "azuracast", "fa-solid fa-sliders" -> "sliders")
    let key = iconStr.toLowerCase();
    if (key.includes('.svg')) {
        key = key.split('/').pop().replace('.svg', '');
    } else if (key.includes('fa-')) {
        const matches = key.match(/fa-([a-z0-9-]+)/g);
        if (matches) {
            key = matches[matches.length - 1].replace('fa-', '');
        }
    }

    return `<svg class="${defaultClass}"><use href="/icons/sprites.svg#${key}"></use></svg>`;
}

// ローディング画面を消す処理
function hideLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;
    
    loader.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 500);
}

// プロフィール概要描画処理
function renderProfileSummary() {
    if (!configProfile) return;

    if (configProfile.name) document.getElementById('profile-name').innerText = configProfile.name;
    if (configProfile.handle) document.getElementById('profile-handle').innerText = `@${configProfile.handle}`;
    if (configProfile.title) document.getElementById('profile-title').innerText = configProfile.title;
    if (configProfile.bio) document.getElementById('profile-bio').innerText = configProfile.bio;
    if (configProfile.avatar) document.getElementById('profile-avatar').src = configProfile.avatar;

    const skillsContainer = document.getElementById('profile-skills-preview');
    if (skillsContainer && configProfile.skills) {
        const allItems = configProfile.skills.flatMap(s => s.items).slice(0, 6);
        skillsContainer.innerHTML = allItems.map(item => `
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-mono">#${item}</span>
        `).join('');
    }
}

// パートナー概要描画処理
function renderPartnersSummary() {
    const grid = document.getElementById('partners-summary-grid');
    if (!grid || !configPartners || !configPartners.partners) return;

    const displayItems = configPartners.partners.slice(0, 3);

    grid.innerHTML = displayItems.map(p => `
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex items-start gap-4 shadow-lg">
            <img src="${p.avatar || './heroImage/profile.jpg'}" alt="${p.name}" loading="lazy" class="w-14 h-14 rounded-xl object-cover border border-[#fca73f]/50 flex-shrink-0">
            <div class="space-y-1.5 min-w-0 flex-grow">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="text-base font-bold text-white font-mono truncate">${p.name}</h3>
                    <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#fca73f]/20 text-[#fca73f] border border-[#fca73f]/30">${p.role}</span>
                </div>
                <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed">${p.bio}</p>
            </div>
        </div>
    `).join('');
}

// DOM構築後の初期化処理
window.addEventListener('DOMContentLoaded', () => {
    function safeParseJSON(elementId, label) {
        const el = document.getElementById(elementId);
        if (!el) return null;
        
        const text = el.textContent.trim();
        if (text.startsWith('<') || text.includes('<!DOCTYPE')) {
            console.error(`[SSI Error] ${label} (${elementId}) の中身がJSONではなくHTMLになっています:`, text.substring(0, 100));
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error(`[JSON Parse Error] ${label} のパースに失敗しました:`, e);
            return null;
        }
    }

    configMain         = safeParseJSON('data-main', '/config/config.json');
    configHeader       = safeParseJSON('data-header', '/config/config_header.json');
    configFooter       = safeParseJSON('data-footer', '/config/config_footer.json');
    configServerInfo   = safeParseJSON('data-server-info', '/serverInfo/info.json');
    configSidemenuList = safeParseJSON('data-sidemenu-list', 'sidemenu-list.json');
    configProfile      = safeParseJSON('data-profile', '/config/config_profile.json');
    configPartners     = safeParseJSON('data-partners', '/config/config_partners.json');

    if (configHeader) renderHeader();
    if (configFooter) renderFooter();
    if (configMain) renderMainContent();
    if (configServerInfo) renderServerInfo();
    if (configSidemenuList) renderSidemenuList();
    if (configProfile) renderProfileSummary();
    if (configPartners) renderPartnersSummary();

    hideLoadingScreen();
});

// ヘッダーナビゲーションの描画
function renderHeader() {
    if (!configHeader) return;

    document.getElementById('header-title').innerText = configHeader.title;
    document.getElementById('header-status').innerText = configHeader.statusText;
    document.getElementById('header-operator').innerText = configHeader.operator;
    document.getElementById('header-shortcut').innerText = configHeader.searchShortcut || '⌘K';

    const navContainer = document.getElementById('header-nav');
    navContainer.innerHTML = configHeader.navLinks.map(link => {
        if (link.href === '#telemetry') {
            return `<a href="#telemetry" onclick="toggleSideMenu(); return false;" class="px-3 py-1.5 rounded-md hover:text-white hover:bg-white/10 transition">${link.label}</a>`;
        }
        return `<a href="${link.href}" class="px-3 py-1.5 rounded-md hover:text-white hover:bg-white/10 transition">${link.label}</a>`;
    }).join('');
}

// ドロワーの開閉関数（ハンバーガーアニメーション & SSE連携）
function toggleSideMenu() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('side-menu-overlay');
    const menuBtn = document.getElementById('menu-btn');

    if (!menu || !overlay) return;

    menu.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');

    if (menuBtn) {
        menuBtn.classList.toggle('active');
    }

    const isOpen = !menu.classList.contains('translate-x-full');

    // 💡 ドロワーオープン時に body のスクロールをロックし、二重スクロールバーを防止
    document.body.classList.toggle('overflow-hidden', isOpen);
    
    if (isOpen) {
        startTelemetry();
    } else {
        stopTelemetry();
    }
}

// 右側ドロワーを右スワイプで閉じられるようにする (スマホ向け)
// 対象は translate-x-full で開閉する右ドロワー全部。ドラッグ中は指に 1:1 追随し、
// 80px 超のドラッグ、または右向きフリック (30px 超 + 速度あり) で閉じる
const SWIPE_DRAWERS = [
    ['side-menu', 'toggleSideMenu'],
    ['inspector-modal', 'closeInspector'],
    ['log-modal', 'closeLogArticle'],
    ['gadget-modal', 'closeGadgetModal'],
    ['infra-modal', 'closeInfraModal'],
    ['device-modal', 'closeDeviceModal'],
];

function addSwipeToClose(menu, closeFnName) {
    if (!menu || menu.dataset.swipeReady) return;
    menu.dataset.swipeReady = '1';

    let startX = 0, startY = 0, dx = 0, dragging = false;
    let lastX = 0, lastT = 0, velocity = 0;

    menu.addEventListener('touchstart', (e) => {
        if (menu.classList.contains('translate-x-full')) return;
        const t = e.touches[0];
        startX = t.clientX; startY = t.clientY; dx = 0; dragging = false;
        lastX = t.clientX; lastT = performance.now(); velocity = 0;
    }, { passive: true });

    menu.addEventListener('touchmove', (e) => {
        if (menu.classList.contains('translate-x-full')) return;
        const t = e.touches[0];
        const mx = t.clientX - startX;
        const my = t.clientY - startY;
        // 横移動が縦移動より大きく、右方向のときだけドラッグとして扱う (縦スクロールは妨げない)
        if (!dragging && mx > 12 && Math.abs(mx) > Math.abs(my) * 1.2) {
            dragging = true;
            menu.style.transition = 'none';
        }
        if (dragging) {
            dx = Math.max(0, mx);
            menu.style.transform = `translateX(${dx}px)`;
            const now = performance.now();
            const dt = now - lastT;
            if (dt > 0) velocity = (t.clientX - lastX) / dt;
            lastX = t.clientX; lastT = now;
        }
    }, { passive: true });

    const finish = () => {
        if (!dragging) return;
        dragging = false;
        menu.style.transition = '';
        menu.style.transform = '';
        if (dx > 80 || (dx > 30 && velocity > 0.35)) {
            const fn = window[closeFnName];
            if (typeof fn === 'function') fn();
        }
        dx = 0;
    };
    menu.addEventListener('touchend', finish);
    menu.addEventListener('touchcancel', finish);
}

function setupDrawerSwipes() {
    SWIPE_DRAWERS.forEach(([id, fnName]) => {
        addSwipeToClose(document.getElementById(id), fnName);
    });
    // #log-modal は log-articles.js が動的に生成するため、出現したら付け直す
    if (document.getElementById('log-section') && !document.getElementById('log-modal')) {
        const obs = new MutationObserver(() => {
            const modal = document.getElementById('log-modal');
            if (modal) {
                addSwipeToClose(modal, 'closeLogArticle');
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDrawerSwipes);
} else {
    setupDrawerSwipes();
}

// sidemenu-list.json からカスタムメニュー描画
function renderSidemenuList() {
    if (!configSidemenuList) return;

    const container = document.getElementById('side-menu-custom-items');
    if (!container) return;

    let html = '';
    if (configSidemenuList.sectionTitle) {
        html += `<h3 class="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase border-t border-slate-200 pt-4 pb-1">${configSidemenuList.sectionTitle}</h3>`;
    }

    if (Array.isArray(configSidemenuList.items)) {
        html += configSidemenuList.items.map(item => {
            const isExternal = item.target === '_blank';
            const rotateClass = '';
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

            return `
                <a href="${item.url || '#'}" ${targetAttr} onclick="toggleSideMenu()" class="block p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-[#fca73f]/10 text-[#fca73f] flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                                ${renderIcon(item.icon)}
                            </div>
                            <div>
                                <span class="text-xs font-bold text-slate-800 block font-mono">${item.label}</span>
                                ${item.description ? `<span class="text-[10px] text-slate-500 block">${item.description}</span>` : ''}
                            </div>
                        </div>
                        <span class="text-xs text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${rotateClass}">
                            ${renderIcon('up-right-inbox.svg')}
                        </span>
                    </div>
                </a>
            `;
        }).join('');
    }

    container.innerHTML = html;
}

// フッターの描画
function renderFooter() {
    if (!configFooter) return;
    document.getElementById('footer-copyright').innerText = configFooter.copyright;
    document.getElementById('footer-tech').innerText = configFooter.techStack || '';
    document.getElementById('footer-node-tag').innerText = configFooter.statusNode || 'Node: Active';

    const linksContainer = document.getElementById('footer-links');
    linksContainer.innerHTML = configFooter.socialLinks.map(link => 
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="hover:text-slate-900 transition flex items-center gap-1.5">
            ${renderIcon(link.icon)}
            <span>${link.label}</span>
        </a>`
    ).join('');
}

// メインコンテンツ描画
function renderMainContent() {
    if (!configMain) return;
    setupHeroSlides(configMain.site.heroImages);
    setupTypingEffect(configMain.site.typingTexts);
    renderCategories(configMain.categories);
    renderProjects();
}

function setupHeroSlides(images) {
    const container = document.getElementById('hero-slides-container');
    if (!container) return;
    container.innerHTML = '';
    images.forEach((imgUrl, index) => {
        const div = document.createElement('div');
        div.className = `hero-slide absolute inset-0 bg-cover bg-center ${index === 0 ? 'opacity-100' : 'opacity-0'}`;
        div.style.backgroundImage = `url('${imgUrl}')`;
        container.appendChild(div);
    });

    let currentIndex = 0;
    const slides = container.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;
    setInterval(() => {
        slides[currentIndex].classList.replace('opacity-100', 'opacity-0');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.replace('opacity-0', 'opacity-100');
    }, 5000);
}

function setupTypingEffect(texts) {
    let textIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const target = document.getElementById('typing-text');
    if (!target) return;

    function type() {
        const currentText = texts[textIdx];
        if (isDeleting) {
            target.innerText = currentText.substring(0, charIdx - 1);
            charIdx--;
        } else {
            target.innerText = currentText.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = isDeleting ? 50 : 100;
        if (!isDeleting && charIdx === currentText.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            textIdx = (textIdx + 1) % texts.length;
            speed = 500;
        }
        setTimeout(type, speed);
    }
    type();
}

function renderCategories(categories) {
    const container = document.getElementById('category-filters');
    if (!container) return;
    container.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap ${cat.id === activeCategory ? 'bg-slate-900 text-[#fca73f] shadow-md font-bold' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`;
        btn.innerHTML = `${renderIcon(cat.icon)}<span>${cat.label}</span>`;
        btn.onclick = () => {
            activeCategory = cat.id;
            renderCategories(categories);
            renderProjects();
        };
        container.appendChild(btn);
    });
}

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = activeCategory === 'all' 
        ? configMain.projects 
        : configMain.projects.filter(p => p.category === activeCategory);

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = "glass-card rounded-2xl overflow-hidden cursor-pointer transition group";
        card.onclick = () => openInspector(p.id);

        card.innerHTML = `
            <div class="h-44 bg-slate-200 relative overflow-hidden">
                <img src="${p.image}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${p.title}">
                <div class="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                    ${p.status}
                </div>
            </div>
            <div class="p-5 space-y-3">
                <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>${p.category.toUpperCase()}</span>
                    <span>${p.date}</span>
                </div>
                <h3 class="text-base font-bold text-slate-900 group-hover:text-[#fca73f] transition">${p.title}</h3>
                <p class="text-slate-500 text-xs line-clamp-2">${p.description}</p>
                <div class="flex flex-wrap gap-1.5 pt-2">
                    ${p.tags.map(t => `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">${t}</span>`).join('')}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// DevTools風スライドパネル表示
async function openInspector(id) {
    const p = configMain.projects.find(item => item.id === id);
    if (!p) return;

    let latestArticleHtml = '';

    if (p.page) {
        try {
            const categoryDir = p.category === 'motor' ? 'motorcycle' : p.category;
            const res = await fetch(`/articles/${categoryDir}/list.json`);

            if (res.ok) {
                const articles = await res.json();
                if (articles && articles.length > 0) {
                    const latest = articles[0];
                    latestArticleHtml = `
                        <div class="bg-slate-900 border border-[#fca73f]/40 rounded-xl p-4 font-mono text-xs space-y-2 shadow-inner">
                            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <span class="text-[#fca73f] font-bold flex items-center gap-1.5">
                                    <span>// LATEST LOG ENTRY</span>
                                </span>
                                <span class="text-[10px] text-slate-400">${latest.date}</span>
                            </div>
                            <a href="${p.page}?json=${latest.id}" class="block group pt-1">
                                <h4 class="text-slate-100 font-bold group-hover:text-[#fca73f] transition flex items-center justify-between gap-2">
                                    <span class="truncate">${latest.title}</span>
                                    <span class="text-[10px] text-slate-400 group-hover:translate-x-1 group-hover:text-[#fca73f] transition-transform flex-shrink-0">→</span>
                                </h4>
                                ${latest.summary ? `<p class="text-slate-400 text-[11px] mt-1 line-clamp-2 font-sans">${latest.summary}</p>` : ''}
                            </a>
                        </div>
                    `;
                }
            }
        } catch (e) {
            console.warn('[Inspector Fetch Error]', e);
        }
    }

    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-mono text-[#fca73f] font-bold">${p.category.toUpperCase()} // ${p.date}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">${p.status}</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">${p.title}</h2>
            ${p.subtitle ? `<p class="text-xs font-mono text-slate-500 -mt-2">${p.subtitle}</p>` : ''}
            <p class="text-slate-600 text-sm leading-relaxed">${p.description}</p>

            ${latestArticleHtml}

            ${(p.specs && Object.keys(p.specs).length > 0) ? `
                <div class="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
                    <span class="text-slate-400 block border-b border-slate-800 pb-1">// SPECIFICATIONS</span>
                    ${Object.entries(p.specs).map(([k, v]) => `<div><span class="text-[#fca73f]">${k}:</span> ${v}</div>`).join('')}
                </div>
            ` : ''}

            ${p.schematic ? `<pre class="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto">${p.schematic}</pre>` : ''}

            ${p.page ? `
                <div class="pt-2 border-t border-slate-100">
                    <a href="${p.page}" class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#fca73f] hover:bg-[#e09230] text-slate-950 font-mono text-xs font-bold transition shadow-lg shadow-[#fca73f]/20 group">
                        <span>別ページに行きます</span>
                        <span class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex items-center justify-center">
                            ${renderIcon('up-right-inbox')}
                        </span>
                    </a>
                </div>
            ` : ''}
        </div>
    `;

    const overlay = document.getElementById('inspector-overlay');
    const panel = document.getElementById('inspector-modal');

    if (overlay && panel) {
        overlay.classList.remove('hidden');
        setTimeout(() => {
            panel.classList.remove('translate-x-full');
        }, 10);
    } else if (panel) {
        panel.classList.remove('hidden');
    }
}

function closeInspector() {
    const overlay = document.getElementById('inspector-overlay');
    const panel = document.getElementById('inspector-modal');

    if (panel) {
        panel.classList.add('translate-x-full');
    }
    if (overlay) {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    } else if (panel) {
        panel.classList.add('hidden');
    }
}

function toggleCommandPalette() {
    const modal = document.getElementById('command-palette');
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        document.getElementById('command-input').focus();
        filterCommandProjects('');
    }
}

function filterCommandProjects(q) {
    const results = document.getElementById('command-results');
    if (!results || !configMain) return;
    results.innerHTML = '';

    // 隠しコマンド: エイリアスのどれかで青基調テーマ、リセット系の単語で解除
    const normalized = normalizeThemeCommand(q);
    const isSecret = THEME_COMMAND_ALIASES.includes(normalized);
    const isReset = THEME_RESET_ALIASES.includes(normalized) && getSiteTheme() === THEME_BLUE_ARCHIVE;
    if (isSecret || isReset) {
        const active = getSiteTheme() === THEME_BLUE_ARCHIVE;
        const item = document.createElement('div');
        item.id = 'command-secret-theme';
        item.className = "p-2 hover:bg-sky-100 rounded cursor-pointer flex items-center justify-between";
        item.onclick = () => {
            setSiteTheme(active && isSecret ? null : (isReset ? null : THEME_BLUE_ARCHIVE));
            toggleCommandPalette();
        };
        item.innerHTML = isReset || active
            ? `<span>テーマをリセットする</span><span class="text-sky-500 text-[10px]">THEME</span>`
            : `<span>??? テーマを変更する</span><span class="text-sky-500 text-[10px]">THEME</span>`;
        results.appendChild(item);
        if (isSecret || isReset) return;
    }

    const filtered = configMain.projects.filter(p =>
        p.title.toLowerCase().includes(q.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
    );

    filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = "p-2 hover:bg-slate-100 rounded cursor-pointer flex items-center justify-between";
        item.onclick = () => {
            toggleCommandPalette();
            openInspector(p.id);
        };
        item.innerHTML = `<span>${p.title}</span><span class="text-slate-400 text-[10px]">${p.category}</span>`;
        results.appendChild(item);
    });
}

function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = text;
    el.title = text;
}

function toggleMetricDetail(id) {
    const detailEl = document.getElementById(id);
    const iconEl = document.getElementById(id + '-icon');
    if (!detailEl) return;

    detailEl.classList.toggle('hidden');
    if (iconEl) {
        iconEl.classList.toggle('rotate-180');
    }
}

function renderServerInfo() {
    if (!configServerInfo) return;

    if (configServerInfo.os?.version) {
        safeSetText('info-os-version', configServerInfo.os.version);
    }
    if (configServerInfo.kernel) {
        safeSetText('info-kernel-spec', `${configServerInfo.kernel.release || '--'} (${configServerInfo.kernel.architecture || '--'})`);
    }
    if (configServerInfo.host) {
        safeSetText('info-host-family', `${configServerInfo.host.vendor || ''} ${configServerInfo.host.name || '--'}`.trim());
    }

    if (configServerInfo.cpu?.cpu) {
        safeSetText('info-cpu-model', configServerInfo.cpu.cpu);
        const cores = configServerInfo.cpu.cores;
        if (cores) {
            safeSetText('detail-cpu-cores', `${cores.physical || '--'} Physical / ${cores.logical || '--'} Logical`);
        }
        if (configServerInfo.cpu.frequency?.base) {
            safeSetText('detail-cpu-freq', `${configServerInfo.cpu.frequency.base} MHz`);
        }
        if (configServerInfo.cpu.march) {
            safeSetText('detail-cpu-arch', configServerInfo.cpu.march);
        }
    }

    if (configServerInfo.os) {
        const osName = configServerInfo.os.prettyName || configServerInfo.os.name || '--';
        safeSetText('info-os-spec', osName);
    }
    if (configServerInfo.memory?.total) {
        safeSetText('detail-mem-total', formatBytes(configServerInfo.memory.total));
    }
    if (Array.isArray(configServerInfo.swap) && configServerInfo.swap[0]) {
        const sw = configServerInfo.swap[0];
        safeSetText('detail-swap-spec', `${formatBytes(sw.used)} / ${formatBytes(sw.total)}`);
    }

    if (Array.isArray(configServerInfo.localip) && configServerInfo.localip[0]) {
        const net = configServerInfo.localip[0];
        safeSetText('info-host-spec', net.name || '--');
        safeSetText('detail-net-iface', net.name || '--');
        safeSetText('detail-net-ip', net.ipv4 || '--');
    }

    if (Array.isArray(configServerInfo.disk) && configServerInfo.disk[0]) {
        const d = configServerInfo.disk[0];
        safeSetText('info-gpu-spec', d.mountpoint || '/');
        safeSetText('detail-disk-mount', d.mountpoint || '/');
        safeSetText('detail-disk-fs', d.filesystem || '--');
    }
}

function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatSpeed(bytesPerSec) {
    if (!bytesPerSec || bytesPerSec === 0) return '0 B/s';
    return formatBytes(bytesPerSec) + '/s';
}

// テレメトリ表示の平滑化 (指数移動平均): 瞬時値の荒ぶりを抑える
// alpha が小さいほど穏やか。3秒間隔の配信に対し 0.35 で約2〜3サンプル分の慣性
const TELEMETRY_SMOOTH_ALPHA = 0.35;
// 接続直後の最初の数サンプルは瞬時値が極端になりやすいので、累積平均でならす
const TELEMETRY_WARMUP_SAMPLES = 4;
const telemetrySmooth = { cpu: null, mem: null, rx: null, tx: null };
const telemetrySmoothCount = { cpu: 0, mem: 0, rx: 0, tx: 0 };
function smoothTelemetry(key, raw) {
    if (typeof raw !== 'number' || !isFinite(raw)) return raw;
    const prev = telemetrySmooth[key];
    telemetrySmoothCount[key] += 1;
    let next;
    if (prev === null) {
        next = raw;
    } else if (telemetrySmoothCount[key] <= TELEMETRY_WARMUP_SAMPLES) {
        next = prev + (raw - prev) / telemetrySmoothCount[key];
    } else {
        next = prev + TELEMETRY_SMOOTH_ALPHA * (raw - prev);
    }
    telemetrySmooth[key] = next;
    return next;
}
function resetTelemetrySmooth() {
    telemetrySmooth.cpu = null;
    telemetrySmooth.mem = null;
    telemetrySmooth.rx = null;
    telemetrySmooth.tx = null;
    telemetrySmoothCount.cpu = 0;
    telemetrySmoothCount.mem = 0;
    telemetrySmoothCount.rx = 0;
    telemetrySmoothCount.tx = 0;
}

// テレメトリ履歴グラフ（直近60点 = 3秒間隔で約3分）
const TELEMETRY_HISTORY_MAX = 60;
const telemetryHistory = { cpu: [], mem: [] };

function pushTelemetryHistory(cpuVal, memVal) {
    if (typeof cpuVal === 'number' && isFinite(cpuVal)) {
        telemetryHistory.cpu.push(cpuVal);
        if (telemetryHistory.cpu.length > TELEMETRY_HISTORY_MAX) telemetryHistory.cpu.shift();
    }
    if (typeof memVal === 'number' && isFinite(memVal)) {
        telemetryHistory.mem.push(memVal);
        if (telemetryHistory.mem.length > TELEMETRY_HISTORY_MAX) telemetryHistory.mem.shift();
    }
    drawTelemetryChart();
}

function drawTelemetryChart() {
    const canvas = document.getElementById('telemetry-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina 対応: 表示サイズに合わせて内部解像度を合わせる
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // グリッド（25%刻み、0〜100%固定）
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.18)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    const drawSeries = (values, color, fill) => {
        if (values.length < 2) return;
        const stepX = w / (TELEMETRY_HISTORY_MAX - 1);
        const offsetX = w - stepX * (values.length - 1);
        ctx.beginPath();
        values.forEach((v, i) => {
            const x = offsetX + stepX * i;
            const y = h - (Math.max(0, Math.min(100, v)) / 100) * h;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        // 面の塗り
        const lastX = offsetX + stepX * (values.length - 1);
        ctx.lineTo(lastX, h);
        ctx.lineTo(offsetX, h);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
    };

    drawSeries(telemetryHistory.mem, '#0ea5e9', 'rgba(14, 165, 233, 0.10)');
    drawSeries(telemetryHistory.cpu, '#fca73f', 'rgba(252, 167, 63, 0.15)');

    if (telemetryHistory.cpu.length < 2 && telemetryHistory.mem.length < 2) {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.7)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('collecting data...', 6, h - 6);
    }
}

// テレメトリ受信データの表示反映 (収集係が書く telemetry.json を読む)
function updateTelemetryUI(data) {
    try {
        if (data.cpu?.cpu?.usage !== undefined) {
            const cpuUsage = smoothTelemetry('cpu', data.cpu.cpu.usage).toFixed(1);
            safeSetText('metric-cpu', `${cpuUsage}%`);
        }

        if (data.memory?.memory) {
            const mem = data.memory.memory;
            const used = formatBytes(mem.used);
            const pct = ((mem.used / mem.total) * 100).toFixed(0);
            safeSetText('metric-ram', `${used} (${pct}%)`);
        }

        if (data.network?.network) {
            const net = data.network.network;
            const rx = formatSpeed(smoothTelemetry('rx', net.rx_sec));
            const tx = formatSpeed(smoothTelemetry('tx', net.tx_sec));
            safeSetText('metric-net', `↓${rx} ↑${tx}`);
        }

        if (data.disk?.drive) {
            const disk = data.disk.drive;
            const used = formatBytes(disk.used);
            const total = formatBytes(disk.size);
            safeSetText('metric-disk', `${used} / ${total}`);
        }

        const cpuVal = telemetrySmooth.cpu !== null ? telemetrySmooth.cpu : data.cpu?.cpu?.usage;
        const memRaw = data.memory?.memory
            ? (data.memory.memory.used / data.memory.memory.total) * 100
            : undefined;
        const memVal = memRaw !== undefined ? smoothTelemetry('mem', memRaw) : undefined;
        pushTelemetryHistory(cpuVal, memVal);

    } catch (e) {
        console.warn('[Telemetry Error]', e);
    }
}

// テレメトリ取得の開始: 収集係が2秒ごとに書き出す JSON を3秒ごとに読みに行く
function startTelemetry() {
    stopTelemetry();

    telemetryHistory.cpu.length = 0;
    telemetryHistory.mem.length = 0;
    // 平滑化の状態 (telemetrySmooth) はページ内で保持する。開くたびに消すと
    // ウォームアップし直しになり、開いた直後の表示が荒れるため

    const fetchTelemetry = async () => {
        try {
            const res = await fetch('/telemetry.json', { cache: 'no-store' });
            if (!res.ok) return;
            updateTelemetryUI(await res.json());
        } catch (e) {
            // ファイルがまだ無い・一時的な失敗は無視して次回に任せる
        }
    };
    fetchTelemetry();
    telemetryTimer = setInterval(fetchTelemetry, 3000);
}

// テレメトリ取得の停止
function stopTelemetry() {
    if (telemetryTimer) {
        clearInterval(telemetryTimer);
        telemetryTimer = null;
    }
}

const RADIO_API_URL = 'https://cast.architectural-n.net/api/nowplaying/nerurus_room_rest';
let isRadioPlaying = false;

// ラジオ再生 / 停止切り替え
function toggleRadioPlay() {
    const audio = document.getElementById('radio-audio');
    const playIcon = document.getElementById('radio-play-icon');

    if (!audio) return;

    if (isRadioPlaying) {
        audio.pause();
        if (playIcon) {
            // sprites.svg#play を参照
            playIcon.innerHTML = renderIcon('radio-play', 'w-5 h-5 fill-[#fca73f]');
        }
        isRadioPlaying = false;
        stopRadioPolling();
    } else {
        audio.load();
        audio.play().then(() => {
            if (playIcon) {
                // sprites.svg#pause を参照
                playIcon.innerHTML = renderIcon('radio-stop', 'w-5 h-5 fill-[#fca73f]');
            }
            isRadioPlaying = true;
            startRadioPolling();
        }).catch(err => {
            console.error('[Radio Playback Error]', err);
        });
    }
}

// 音量コントロール（割合に応じて sprites.svg のシンボルを切替）
function changeRadioVolume(val) {
    const audio = document.getElementById('radio-audio');
    const volumeIcon = document.getElementById('radio-volume-icon');
    const volumeVal = parseFloat(val);

    if (audio) {
        audio.volume = volumeVal;
    }

    if (volumeIcon) {
        if (volumeVal === 0) {
            volumeIcon.innerHTML = renderIcon('volume-low', 'w-6 h-6 fill-slate-900');
        } else if (volumeVal < 0.5) {
            volumeIcon.innerHTML = renderIcon('volume', 'w-6 h-6 fill-slate-900');
        } else {
            volumeIcon.innerHTML = renderIcon('volume-high', 'w-6 h-6 fill-slate-900');
        }
    }
}

// ラジオメタデータ取得
async function updateNowPlaying() {
    try {
        const res = await fetch(RADIO_API_URL);
        if (!res.ok) return;

        const data = await res.json();

        const audio = document.getElementById('radio-audio');
        if (audio && data.station && data.station.listen_url) {
            if (audio.src !== data.station.listen_url) {
                audio.src = data.station.listen_url;
            }
        }

        if (data.now_playing && data.now_playing.song) {
            const song = data.now_playing.song;
            
            document.getElementById('radio-title').innerText = song.title || 'Unknown Title';
            document.getElementById('radio-artist').innerText = song.artist || 'ねるるラジオ';

            if (song.art) {
                document.getElementById('radio-art').src = song.art;
            }
        }

        const liveDot = document.getElementById('radio-live-dot');
        const liveText = document.getElementById('radio-live-text');
        
        if (liveText && liveDot) {
            if (data.live && data.live.is_live) {
                liveText.innerText = `LIVE // ${data.live.streamer_name || 'Streamer'}`;
                liveDot.className = 'w-1.5 h-1.5 rounded-full bg-red-500 animate-ping';
            } else {
                liveText.innerText = 'AUTO DJ // ON AIR';
                liveDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
            }
        }

    } catch (e) {
        console.warn('[Radio API Fetch Error]', e);
    }
}

// ポーリングの動的制御（再生中のみ10秒置きにAPI取得）
function startRadioPolling() {
    updateNowPlaying();
    if (!radioIntervalId) {
        radioIntervalId = setInterval(updateNowPlaying, 10000);
    }
}

function stopRadioPolling() {
    if (radioIntervalId) {
        clearInterval(radioIntervalId);
        radioIntervalId = null;
    }
}

// 初期アイコン描画設定
document.addEventListener('DOMContentLoaded', () => {
    updateNowPlaying();

    const playIcon = document.getElementById('radio-play-icon');
    const volumeIcon = document.getElementById('radio-volume-icon');
    const volumeInput = document.getElementById('radio-volume');

    if (playIcon) playIcon.innerHTML = renderIcon('radio-play', 'w-5 h-5 fill-[#fca73f]');
    if (volumeIcon && volumeInput) changeRadioVolume(volumeInput.value);
});

// ショートカットキー & ESC閉じる処理
window.addEventListener('keydown', (e) => {
    // パレット表示中、隠しコマンド入力時の Enter でテーマ切替
    if (e.key === 'Enter') {
        const cmdPalette = document.getElementById('command-palette');
        const cmdInput = document.getElementById('command-input');
        if (cmdPalette && cmdInput && !cmdPalette.classList.contains('hidden')) {
            const v = (cmdInput.value || '').trim().toLowerCase();
            if (v === THEME_BLUE_ARCHIVE) {
                e.preventDefault();
                setSiteTheme(getSiteTheme() === THEME_BLUE_ARCHIVE ? null : THEME_BLUE_ARCHIVE);
                toggleCommandPalette();
                return;
            }
            if (v === 'reset' && getSiteTheme()) {
                e.preventDefault();
                setSiteTheme(null);
                toggleCommandPalette();
                return;
            }
        }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
    }
    if (e.key === 'Escape') {
        closeInspector();
        const cmdPalette = document.getElementById('command-palette');
        if (cmdPalette) cmdPalette.classList.add('hidden');
        
        const menu = document.getElementById('side-menu');
        if (menu && !menu.classList.contains('translate-x-full')) {
            toggleSideMenu();
        }
    }
});