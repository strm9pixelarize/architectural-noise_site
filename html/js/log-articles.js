// 記事紹介の共通モジュール（room_design.html のスタイルを他ページでも使うためのもの）
// 使い方: ページ側に #log-filters と #log-articles-grid を置き、
//         initLogArticles('/articles/<カテゴリ>/list.json', 'READERのラベル') を呼ぶ。
// list.json の形式は articles/design/list.json と同じ:
//   [{ "id", "date", "category", "title", "summary", "thumbnail", "file", "tags" }]
// 記事が0件・取得失敗のときは、id="log-section" のセクションごと非表示にする。

let logArticles = [];
let activeLogCategory = 'all';
let logReaderLabel = '// LOG_READER';

async function initLogArticles(listUrl, readerLabel) {
    if (readerLabel) logReaderLabel = readerLabel;
    ensureLogDrawer();
    try {
        const res = await fetch(listUrl);
        if (!res.ok) { hideLogSection(); return; }
        logArticles = await res.json();
        if (!Array.isArray(logArticles) || logArticles.length === 0) { hideLogSection(); return; }

        renderLogFilters();
        renderLogGrid();

        // URLパラメータ ?json=<id> が指定されている場合は自動で記事を開く
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('json');
        if (targetId) openLogArticle(targetId);
    } catch (e) {
        console.error('[Log Articles Load Error]', e);
        hideLogSection();
    }
}

function hideLogSection() {
    const section = document.getElementById('log-section');
    if (section) section.style.display = 'none';
}

function renderLogFilters() {
    const container = document.getElementById('log-filters');
    if (!container) return;

    const uniqueCats = [...new Set(logArticles.map(a => a.category).filter(Boolean))];
    const categories = ['all', ...uniqueCats];

    container.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isActive = cat === activeLogCategory;
        btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap ${
            isActive
                ? 'bg-slate-900 text-[#fca73f] shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
        }`;
        btn.innerText = cat === 'all' ? 'ALL LOGS' : cat;
        btn.onclick = () => {
            activeLogCategory = cat;
            renderLogFilters();
            renderLogGrid();
        };
        container.appendChild(btn);
    });
}

function renderLogGrid() {
    const grid = document.getElementById('log-articles-grid');
    if (!grid) return;

    const filtered = activeLogCategory === 'all'
        ? logArticles
        : logArticles.filter(a => a.category === activeLogCategory);

    grid.innerHTML = filtered.map(item => `
        <div onclick="openLogArticle('${item.id}')" class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl hover:border-[#fca73f]/50 transition duration-300 cursor-pointer flex flex-col justify-between group">
            <div>
                ${item.thumbnail ? `
                    <div class="h-44 bg-slate-950 relative overflow-hidden border-b border-slate-800">
                        <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    </div>
                ` : ''}
                <div class="p-6 space-y-3">
                    <div class="flex items-center justify-between text-[10px] font-mono">
                        <span class="px-2 py-0.5 rounded bg-[#fca73f]/15 text-[#fca73f] border border-[#fca73f]/30 font-bold">${item.category || 'LOG'}</span>
                        <span class="text-slate-400">${item.date || ''}</span>
                    </div>
                    <h3 class="text-lg font-bold font-mono text-white group-hover:text-[#fca73f] transition">${item.title}</h3>
                    <p class="text-slate-400 text-xs line-clamp-2 font-sans leading-relaxed">${item.summary || ''}</p>
                </div>
            </div>

            <div class="px-6 pb-5 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                ${(item.tags || []).map(t => `
                    <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-mono">#${t}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function ensureLogDrawer() {
    if (document.getElementById('log-modal')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
        <div id="log-modal-overlay" onclick="closeLogArticle()" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 hidden transition-opacity duration-300"></div>
        <aside id="log-modal" class="fixed top-0 right-0 bottom-0 w-full sm:w-[680px] bg-[#f7f4eb] border-l border-slate-300 z-50 transform translate-x-full transition-transform duration-300 ease-in-out p-6 sm:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
                <div class="flex items-center justify-between border-b border-slate-300 pb-4 mb-6">
                    <div class="flex items-center gap-2 font-mono text-xs text-[#fca73f] font-bold">
                        <span>${logReaderLabel}</span>
                    </div>
                    <button onclick="closeLogArticle()" class="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-xs transition border border-slate-300 flex items-center gap-1.5">
                        <span>ESC</span>
                        <span class="text-[10px]">✕</span>
                    </button>
                </div>
                <div id="modal-log-content" class="space-y-6"></div>
            </div>
            <div class="pt-6 mt-6 border-t border-slate-300 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>STATUS: READING LOG</span>
                <span>ARCHITECTURAL NOISE</span>
            </div>
        </aside>
    `;
    document.body.appendChild(wrap);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLogArticle();
    });
}

async function openLogArticle(id) {
    const item = logArticles.find(a => a.id === id);
    if (!item) return;

    const content = document.getElementById('modal-log-content');
    let bodyHtml = '<p class="text-xs font-mono text-slate-400">Loading markdown...</p>';

    if (item.file) {
        try {
            const res = await fetch(item.file);
            if (res.ok) {
                const mdText = await res.text();
                if (!mdText.trim().startsWith('<') && !mdText.includes('<!DOCTYPE')) {
                    bodyHtml = `
                        <article class="prose prose-slate max-w-none text-sm font-sans leading-relaxed bg-white p-5 sm:p-6 rounded-2xl border border-slate-300 shadow-sm space-y-4">
                            ${marked.parse(mdText)}
                        </article>
                    `;
                }
            }
        } catch (e) {
            console.warn('[Markdown Fetch Error]', e);
        }
    }

    content.innerHTML = `
        <div class="space-y-5">
            <div class="space-y-2">
                <div class="flex items-center gap-2 font-mono text-xs">
                    <span class="px-2 py-0.5 rounded bg-slate-900 text-[#fca73f] font-bold">${item.category || 'LOG'}</span>
                    <span class="text-slate-500">${item.date || ''}</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-bold font-mono text-slate-900">${item.title}</h1>
                ${item.summary ? `<p class="text-slate-600 text-sm font-sans leading-relaxed">${item.summary}</p>` : ''}
            </div>

            ${item.thumbnail ? `
                <img src="${item.thumbnail}" alt="${item.title}" class="w-full max-h-72 object-cover rounded-2xl border border-slate-300 shadow-md">
            ` : ''}

            ${bodyHtml}
        </div>
    `;

    content.querySelectorAll('pre code').forEach(block => {
        if (window.hljs) hljs.highlightElement(block);
    });

    const overlay = document.getElementById('log-modal-overlay');
    const modal = document.getElementById('log-modal');
    overlay.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('translate-x-full'), 10);
}

function closeLogArticle() {
    const overlay = document.getElementById('log-modal-overlay');
    const modal = document.getElementById('log-modal');
    if (!modal) return;
    modal.classList.add('translate-x-full');
    if (overlay) {
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}
