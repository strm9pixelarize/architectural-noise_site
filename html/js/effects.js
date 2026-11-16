// 演出エフェクト（カーソル軌跡＋クリックバースト）
// - ヘッダーの .fx-toggle ボタンで ON/OFF。状態は localStorage に保存される
// - prefers-reduced-motion の環境では初回は OFF（ボタンで手動 ON は可能）
// - 依存なし。canvas を1枚だけ生成し、粒子が無いときは描画を休止する

(() => {
    const STORAGE_KEY = 'an-fx-enabled';
    const BRAND = '252, 167, 63';      // #fca73f
    const SUB = '14, 165, 233';        // sky-500

    let enabled = false;
    let canvas = null;
    let ctx = null;
    let rafId = null;
    let particles = [];
    let lastTrailAt = 0;

    function initialState() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'on') return true;
        if (saved === 'off') return false;
        // 未保存なら、OS の「視差効果を減らす」を尊重して OFF を初期値にする
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function ensureCanvas() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.id = 'fx-canvas';
        canvas.style.cssText =
            'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90;';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function loop() {
        if (!enabled) { rafId = null; return; }
        rafId = requestAnimationFrame(loop);
        if (!ctx) return;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles = particles.filter(p => p.life > 0);
        for (const p of particles) {
            p.life -= p.decay;
            if (p.type === 'trail') {
                p.y -= 0.3;
                const r = Math.max(0, p.size * p.life);
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${0.55 * p.life})`;
                ctx.fill();
            } else if (p.type === 'spark') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12;              // 重力
                if (p.y > window.innerHeight - 4) { p.y = window.innerHeight - 4; p.vy *= -0.45; } // 床で跳ねる
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${0.85 * p.life})`;
                ctx.fill();
            } else if (p.type === 'ring') {
                p.r += 2.6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${p.color}, ${0.6 * p.life})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        if (particles.length === 0) {
            // 粒子が尽きたらループを止めて負荷をゼロにする
            cancelAnimationFrame(rafId);
            rafId = null;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }

    function kick() {
        if (enabled && rafId === null) rafId = requestAnimationFrame(loop);
    }

    function onMove(e) {
        if (!enabled) return;
        const now = performance.now();
        if (now - lastTrailAt < 12) return;   // 出しすぎ防止
        lastTrailAt = now;
        particles.push({
            type: 'trail',
            x: e.clientX + (Math.random() - 0.5) * 8,
            y: e.clientY + (Math.random() - 0.5) * 8,
            size: 2 + Math.random() * 2.5,
            life: 1,
            decay: 0.03 + Math.random() * 0.02,
            color: Math.random() < 0.75 ? BRAND : SUB,
        });
        kick();
    }

    function onClick(e) {
        if (!enabled) return;
        // リング1つ
        particles.push({ type: 'ring', x: e.clientX, y: e.clientY, r: 2, life: 1, decay: 0.045, color: BRAND });
        // 跳ねる粒子
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
            const speed = 1.6 + Math.random() * 2.4;
            particles.push({
                type: 'spark',
                x: e.clientX,
                y: e.clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.6,
                size: 1.8 + Math.random() * 2,
                life: 1,
                decay: 0.016 + Math.random() * 0.012,
                color: Math.random() < 0.7 ? BRAND : SUB,
            });
        }
        kick();
    }

    function reflectButtons() {
        document.querySelectorAll('.fx-toggle').forEach(btn => {
            btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            btn.style.opacity = enabled ? '1' : '0.45';
            btn.title = enabled ? 'エフェクト: ON（クリックでOFF）' : 'エフェクト: OFF（クリックでON）';
        });
    }

    function setEnabled(next, save = true) {
        enabled = next;
        if (save) localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
        if (enabled) {
            ensureCanvas();
            kick();
        } else {
            particles = [];
            if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
        reflectButtons();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.fx-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                setEnabled(!enabled);
            });
        });
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onClick, { passive: true });
        setEnabled(initialState(), false);
    });
})();
