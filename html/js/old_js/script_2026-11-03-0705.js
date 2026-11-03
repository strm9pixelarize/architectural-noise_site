let configMain = null;
let configHeader = null;
let configFooter = null;
let configServerInfo = null;
let configSidemenuList = null;

let activeCategory = 'all';
let synthOsc = null;
let synthCtx = null;
let isSynthPlaying = false;
let telemetrySource = null;

// アイコン描画用ヘルパー関数（画像パスとFont Awesomeの両対応）
function renderIcon(iconStr, defaultClass = 'fa-solid fa-link') {
    if (!iconStr) iconStr = defaultClass;
    
    // / から始まる、httpから始まる、または画像拡張子を含む場合は img タグ
    if (iconStr.startsWith('/') || iconStr.startsWith('http') || /\.(png|svg|jpg|jpeg|webp|gif|ico)$/i.test(iconStr)) {
        return `<img src="${iconStr}" alt="icon" class="w-4 h-4 object-contain">`;
    }
    
    // それ以外は Font Awesome (i タグ)
    return `<i class="${iconStr}"></i>`;
}

// ローディング画面を消す関数
function hideLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;
    
    // ふわっと消すためのアニメーション
    loader.classList.add('opacity-0', 'pointer-events-none');
    
    // アニメーション完了後にDOMから非表示にする
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 500);
}

// index.htmlの初期化処理（DOMContentLoaded）の中に追記
function renderProfileSummary() {
    if (!configProfile) return;

    if (configProfile.name) document.getElementById('profile-name').innerText = configProfile.name;
    if (configProfile.handle) document.getElementById('profile-handle').innerText = `@${configProfile.handle}`;
    if (configProfile.title) document.getElementById('profile-title').innerText = configProfile.title;
    if (configProfile.bio) document.getElementById('profile-bio').innerText = configProfile.bio;
    if (configProfile.avatar) document.getElementById('profile-avatar').src = configProfile.avatar;

    // スキルタグのプレビュー描画
    const skillsContainer = document.getElementById('profile-skills-preview');
    if (skillsContainer && configProfile.skills) {
        const allItems = configProfile.skills.flatMap(s => s.items).slice(0, 6);
        skillsContainer.innerHTML = allItems.map(item => `
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-mono">#${item}</span>
        `).join('');
    }
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

    configMain         = safeParseJSON('data-main', 'config.json');
    configHeader       = safeParseJSON('data-header', 'config_header.json');
    configFooter       = safeParseJSON('data-footer', 'config_footer.json');
    configServerInfo   = safeParseJSON('data-server-info', 'serverInfo/info.json');
    configSidemenuList = safeParseJSON('data-sidemenu-list', 'sidemenu-list.json');
    configProfile      = safeParseJSON('data-profile', 'config_profile.json');

    if (configHeader) renderHeader();
    if (configFooter) renderFooter();
    if (configMain) renderMainContent();
    if (configServerInfo) renderServerInfo();
    if (configSidemenuList) renderSidemenuList();
    if (configProfile) renderProfileSummary();

    hideLoadingScreen();
});

// ヘッダーナビゲーションの描画
function renderHeader() {
    if (!configHeader) return;

    if (configHeader.favicon) {
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = configHeader.favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

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

// ドロワー（引き出し）の開閉関数
function toggleSideMenu() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('side-menu-overlay');

    if (!menu || !overlay) return;

    menu.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
}

// sidemenu-list.json からカスタムメニュー・SNS群を動的描画
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
            const chevronIcon = isExternal ? 'fa-arrow-up-right-from-square' : 'fa-chevron-right';
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

            return `
                <a href="${item.url || '#'}" ${targetAttr} onclick="toggleSideMenu()" class="block p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                                ${renderIcon(item.icon)}
                            </div>
                            <div>
                                <span class="text-xs font-bold text-slate-800 block font-mono">${item.label}</span>
                                ${item.description ? `<span class="text-[10px] text-slate-500 block">${item.description}</span>` : ''}
                            </div>
                        </div>
                        <i class="fa-solid ${chevronIcon} text-[10px] text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
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
        `<a href="${link.url}" target="_blank" class="hover:text-slate-900 transition flex items-center gap-1.5">
            ${renderIcon(link.icon, '')}
            <span>${link.label}</span>
        </a>`
    ).join('');
}

// メインコンテンツの描画
function renderMainContent() {
    if (!configMain) return;
    setupHeroSlides(configMain.site.heroImages);
    setupTypingEffect(configMain.site.typingTexts);
    renderCategories(configMain.categories);
    renderProjects();
    startTelemetry();
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
        btn.className = `px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 ${cat.id === activeCategory ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`;
        btn.innerHTML = `${renderIcon(cat.icon, 'fa-solid fa-folder')}<span>${cat.label}</span>`;
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
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${p.title}">
                <div class="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                    ${p.status}
                </div>
            </div>
            <div class="p-5 space-y-3">
                <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>${p.category.toUpperCase()}</span>
                    <span>${p.date}</span>
                </div>
                <h3 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">${p.title}</h3>
                <p class="text-slate-500 text-xs line-clamp-2">${p.description}</p>
                <div class="flex flex-wrap gap-1.5 pt-2">
                    ${p.tags.map(t => `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">${t}</span>`).join('')}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function openInspector(id) {
    const p = configMain.projects.find(item => item.id === id);
    if (!p) return;

    // 最新記事情報を取得して格納する変数
    let latestArticleHtml = '';

    // page または category が存在する場合、対応する list.json を取得
    if (p.page) {
        try {
            const categoryDir = p.category === 'motor' ? 'motorcycle' : p.category;
            const res = await fetch(`/articles/${categoryDir}/list.json`);

            if (res.ok) {
                const articles = await res.json();
                if (articles && articles.length > 0) {
                    const latest = articles[0]; // 先頭の最新記事
                    latestArticleHtml = `
                        <div class="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 font-mono text-xs space-y-2 shadow-inner">
                            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <span class="text-indigo-400 font-bold flex items-center gap-1.5">
                                    <i class="fa-solid fa-newspaper text-[10px]"></i>
                                    <span>// LATEST LOG ENTRY</span>
                                </span>
                                <span class="text-[10px] text-slate-400">${latest.date}</span>
                            </div>
                            <a href="${p.page}?json=${latest.id}" class="block group pt-1">
                                <h4 class="text-slate-100 font-bold group-hover:text-indigo-300 transition flex items-center justify-between gap-2">
                                    <span class="truncate">${latest.title}</span>
                                    <i class="fa-solid fa-arrow-right text-[10px] text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-400 transition-transform flex-shrink-0"></i>
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
                <span class="text-xs font-mono text-indigo-600 font-bold">${p.category.toUpperCase()} // ${p.date}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">${p.status}</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">${p.title}</h2>
            ${p.subtitle ? `<p class="text-xs font-mono text-slate-500 -mt-2">${p.subtitle}</p>` : ''}
            <p class="text-slate-600 text-sm leading-relaxed">${p.description}</p>

            <!-- 最新記事ブロック（list.json がある場合のみ動的に表示） -->
            ${latestArticleHtml}

            <!-- スペック情報（specs が存在し、項目が1つ以上ある場合のみ表示） -->
            ${(p.specs && Object.keys(p.specs).length > 0) ? `
                <div class="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
                    <span class="text-slate-400 block border-b border-slate-800 pb-1">// SPECIFICATIONS</span>
                    ${Object.entries(p.specs).map(([k, v]) => `<div><span class="text-indigo-400">${k}:</span> ${v}</div>`).join('')}
                </div>
            ` : ''}

            ${p.schematic ? `<pre class="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto">${p.schematic}</pre>` : ''}

            ${p.page ? `
                <div class="pt-2 border-t border-slate-100">
                    <a href="${p.page}" class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-indigo-600/30 group">
                        <span>OPEN DEDICATED PAGE</span>
                        <i class="fa-solid fa-arrow-up-right-from-square text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    document.getElementById('inspector-modal').classList.remove('hidden');
}

function closeInspector() {
    document.getElementById('inspector-modal').classList.add('hidden');
}

function toggleCommandPalette() {
    const modal = document.getElementById('command-palette');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        document.getElementById('command-input').focus();
        filterCommandProjects('');
    }
}

function filterCommandProjects(q) {
    const results = document.getElementById('command-results');
    results.innerHTML = '';
    if (!configMain) return;

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

function startTelemetry() {
    if (telemetrySource) telemetrySource.close();

    telemetrySource = new EventSource('/api/stream/sys-telemetry');

    telemetrySource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.cpu?.cpu?.usage !== undefined) {
                const cpuUsage = data.cpu.cpu.usage.toFixed(1);
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
                const rx = formatSpeed(net.rx_sec);
                const tx = formatSpeed(net.tx_sec);
                safeSetText('metric-net', `↓${rx} ↑${tx}`);
            }

            if (data.disk?.drive) {
                const disk = data.disk.drive;
                const used = formatBytes(disk.used);
                const total = formatBytes(disk.size);
                safeSetText('metric-disk', `${used} / ${total}`);
            }

        } catch (e) {
            console.warn('[SSE Error]', e);
        }
    };
}

const RADIO_API_URL = 'https://radio.enoki.xyz/api/nowplaying/neruru-radio';
let isRadioPlaying = false;

// 再生 / 停止の切り替え
function toggleRadioPlay() {
    const audio = document.getElementById('radio-audio');
    const playIcon = document.getElementById('radio-play-icon');

    if (!audio) return;

    if (isRadioPlaying) {
        audio.pause();
        playIcon.className = 'fa-solid fa-play text-xs ml-0.5';
        isRadioPlaying = false;
    } else {
        // 最新のライブバッファから再生させるために再ロード
        audio.load();
        audio.play().then(() => {
            playIcon.className = 'fa-solid fa-pause text-xs';
            isRadioPlaying = true;
        }).catch(err => {
            console.error('[Radio Playback Error]', err);
        });
    }
}

// 音量変更
function changeRadioVolume(val) {
    const audio = document.getElementById('radio-audio');
    if (audio) {
        audio.volume = parseFloat(val);
    }
}

// APIから現在再生中の情報を取得・反映
async function updateNowPlaying() {
    try {
        const res = await fetch(RADIO_API_URL);
        if (!res.ok) return;

        const data = await res.json();

        // 1. ストリームURLの設定（初回および更新時）
        const audio = document.getElementById('radio-audio');
        if (audio && data.station && data.station.listen_url) {
            if (audio.src !== data.station.listen_url) {
                audio.src = data.station.listen_url;
            }
        }

        // 2. 現在再生中の曲情報
        if (data.now_playing && data.now_playing.song) {
            const song = data.now_playing.song;
            
            document.getElementById('radio-title').innerText = song.title || 'Unknown Title';
            document.getElementById('radio-artist').innerText = song.artist || 'ねるるラジオ';

            if (song.art) {
                document.getElementById('radio-art').src = song.art;
            }
        }

        // 3. 配信ステータス（LIVE / DJ放送判定）
        const liveDot = document.getElementById('radio-live-dot');
        const liveText = document.getElementById('radio-live-text');
        
        if (data.live && data.live.is_live) {
            liveText.innerText = `LIVE // ${data.live.streamer_name || 'Streamer'}`;
            liveDot.className = 'w-2 h-2 rounded-full bg-red-500 animate-ping';
        } else {
            liveText.innerText = 'AUTO DJ // ON AIR';
            liveDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
        }

    } catch (e) {
        console.warn('[Radio API Fetch Error]', e);
    }
}

// 初期化 & 10秒ごとの自動更新
document.addEventListener('DOMContentLoaded', () => {
    updateNowPlaying();
    setInterval(updateNowPlaying, 10000);
});

window.addEventListener('keydown', (e) => {
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