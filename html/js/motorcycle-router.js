document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('json');

    const listContainer = document.getElementById('article-list-container');
    const detailContainer = document.getElementById('article-detail-container');

    // パラメータなし、または top-page の場合は「記事一覧（HTML）」を表示
    if (!articleId || articleId === 'top-page') {
        listContainer.classList.remove('hidden');
        detailContainer.classList.add('hidden');
        await renderArticleList();
    } else {
        // 記事IDがある場合は「個別記事（Markdown）」を表示
        listContainer.classList.add('hidden');
        detailContainer.classList.remove('hidden');
        await renderArticleDetail(articleId);
    }
});

// ★ 1. 全記事一覧の動的カード生成（HTML表示）
async function renderArticleList() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    try {
        const res = await fetch('/articles/motorcycle/list.json');
        if (!res.ok) throw new Error('list.json の読み込みに失敗しました');
        
        const articles = await res.json();

        if (articles.length === 0) {
            grid.innerHTML = `<p class="text-slate-400 font-mono text-sm col-span-full text-center py-12">No articles found.</p>`;
            return;
        }

        grid.innerHTML = articles.map(art => `
            <a href="/motorcycle.html?json=${art.id}" class="glass-card rounded-2xl overflow-hidden group transition block border border-slate-800 hover:border-[#fca73f]/50 bg-slate-900/60">
                <div class="h-48 bg-slate-800 relative overflow-hidden">
                    <img src="${art.image || '/heroImage/tokyo_station.jpg'}" alt="${art.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <div class="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 text-[11px] font-mono border border-white/10">
                        ${art.date}
                    </div>
                </div>
                <div class="p-5 space-y-3">
                    <h2 class="text-lg font-bold text-slate-100 group-hover:text-[#fca73f] transition line-clamp-1">${art.title}</h2>
                    <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed">${art.summary}</p>
                    <div class="flex flex-wrap gap-1.5 pt-2">
                        ${(art.tags || []).map(t => `<span class="px-2 py-0.5 rounded bg-[#fca73f]/10 text-[#fca73f] border border-[#fca73f]/30 text-[10px] font-mono">#${t}</span>`).join('')}
                    </div>
                </div>
            </a>
        `).join('');

    } catch (err) {
        console.error('[List Error]', err);
        grid.innerHTML = `<p class="text-red-400 font-mono text-sm col-span-full text-center py-12">記事一覧の取得に失敗しました。</p>`;
    }
}

// ★ 個別Markdown記事のレンダリング
async function renderArticleDetail(rawArticleId) {
    // 入力されたIDから末尾の .md を除去（二重付与防止）
    const articleId = rawArticleId.replace(/\.md$/, '');
    const markdownBody = document.getElementById('markdown-body');

    try {
        const res = await fetch(`/articles/motorcycle/${articleId}.md`);

        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

        const text = await res.text();

        // 誤ってHTMLが返ってきた場合のガード
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            throw new Error('指定された記事が見つかりません');
        }

        // Markdown変換＆挿入
        markdownBody.innerHTML = marked.parse(text);

        // コードハイライト適用
        if (window.hljs) hljs.highlightAll();

    } catch (err) {
        console.error('[Detail Error]', err);
        markdownBody.innerHTML = `
            <div class="bg-slate-900/80 border border-red-500/30 rounded-2xl p-8 text-center my-8">
                <i class="fa-solid fa-triangle-exclamation text-[#fca73f] text-3xl mb-3"></i>
                <h2 class="text-lg font-bold text-slate-200 font-mono">ARTICLE NOT FOUND</h2>
                <p class="text-slate-400 text-xs mt-2">指定された記事（<code class="text-[#fca73f]">${articleId}.md</code>）が見つかりませんでした。</p>
                <a href="/motorcycle.html" class="inline-block mt-4 px-4 py-2 bg-[#fca73f] hover:bg-[#e09230] text-slate-950 font-bold text-xs font-mono rounded-lg transition">一覧へ戻る</a>
            </div>
        `;
    }
}