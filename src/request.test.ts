import { after, afterEach, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'node-html-parser';
import * as request from './request.js';

const articleHTML = `
<div id="main-content" class="bbs-screen bbs-content"><div class="article-metaline"><span class="article-meta-tag">作者</span><span class="article-meta-value">WesleyDoge (可愛的狗勾)</span></div><div class="article-metaline-right"><span class="article-meta-tag">看板</span><span class="article-meta-value">Gamesale</span></div><div class="article-metaline"><span class="article-meta-tag">標題</span><span class="article-meta-value">[PS4] 徵 PSN點數1800點（88折1585）</span></div><div class="article-metaline"><span class="article-meta-tag">時間</span><span class="article-meta-value">Tue Feb 27 22:58:21 2024</span></div>
abccd
<span class="f2">※ 發信站: 批踢踢實業坊(ptt.cc), 來自: 223.136.92.39 (臺灣)
</span><span class="f2">※ 文章網址: <a href="https://www.ptt.cc/bbs/Gamesale/M.1709045903.A.637.html" target="_blank" rel="noreferrer noopener nofollow">https://www.ptt.cc/bbs/Gamesale/M.1709045903.A.637.html</a>
</span></div>
`;

const pageHTML = `
<div id="main-container">
  <div id="action-bar-container">
    <div class="action-bar">
      <div class="btn-group btn-group-paging">
        <a class="btn wide" href="/bbs/Gamesale/index1.html">最舊</a>
        <a class="btn wide" href="/bbs/Gamesale/index4013.html">‹ 上頁</a>
        <a class="btn wide" href="/bbs/Gamesale/index4015.html">下頁 ›</a>
        <a class="btn wide" href="/bbs/Gamesale/index.html">最新</a>
      </div>
    </div>
  </div>
  <div class="r-list-container action-bar-margin bbs-screen">
    <div class="r-ent"><div class="title"><a href="/bbs/Gamesale/M.1709052906.A.DF0.html">1</a></div>
      <div class="meta"><div class="author">verypower</div></div>
    </div>
    <div class="r-ent"><div class="title">(已被r66刪除) &lt;spy99915&gt;2.1</div>
      <div class="meta"><div class="author">-</div></div>
    </div>
    <div class="r-ent"><div class="title"><a href="/bbs/Gamesale/M.1709058497.A.7FE.html">2</a></div>
      <div class="meta"><div class="author">asubelieve</div></div>
    </div>
    <div class="r-list-sep"></div>
    <div class="r-ent"><div class="title"><a href="/bbs/Gamesale/M.1709059645.A.318.html">3</a></div>
      <div class="meta"><div class="author">nocuper</div></div>
    </div>
  </div>
</div>
`;

const mockedFetch = mock.fn(fetch);
global.fetch = mockedFetch;

describe('test getArticle', () => {
  let DOM = parse(articleHTML);
  before(() => {
    mockedFetch.mock.mockImplementation(async () => new Response(DOM.outerHTML));
  });
  after(() => {
    mockedFetch.mock.resetCalls();
    mockedFetch.mock.restore();
  });
  afterEach(() => { DOM = parse(articleHTML); });

  it('common', async () => {
    const res = await request.getArticle('index.html', 'Gamesale');
    assert.equal(res, 'abccd', 'article content not matched');
  });

  it('no header', async () => {
    DOM.querySelectorAll('[class^=.article-meta]').forEach(e => e.remove());
    const res = await request.getArticle('index.html', 'Gamesale');
    assert.equal(res, 'abccd', 'article content not matched');
  });

  it('no footer', async () => {
    DOM.querySelectorAll('.f2').forEach(el => el.remove());
    const res = await request.getArticle('index.html', 'Gamesale');
    assert.equal(res, 'abccd', 'article content not matched');
  });
});

describe('test getPageInfo', () => {
  let DOM = parse(pageHTML);
  before(() => {
    mockedFetch.mock.mockImplementation(async () => new Response(DOM.outerHTML));
  });
  after(() => {
    mockedFetch.mock.resetCalls();
    mockedFetch.mock.restore();
  });
  afterEach(() => { DOM = parse(pageHTML); });

  it('common', async () => {
    const res = await request.getPageInfo({ board: 'Gamesale', getContent: true, keyword: '售', pageLength: 1 });
    assert.deepEqual(res.articles.map(e => e.id), ['17090584977FE', '1709052906DF0'], 'articles\' id not matched');
    assert.equal(res.page, 4014, 'pageNum not matched');
  });

  it('id sorted desc', async () => {
    const links = DOM.querySelectorAll('.r-ent:not(.r-list-sep ~ *) a');
    const hrefs = links.map(e => e.getAttribute('href') ?? '').reverse();
    links.forEach((e, i) => { e.setAttribute('href', hrefs[i]); });

    const res = await request.getPageInfo({ board: 'Gamesale', getContent: false, pageLength: 1 });
    assert.deepEqual(res.articles.map(e => e.id), ['17090584977FE', '1709052906DF0'], 'articles\' id not matched');
  });

  it('stop when lower than lastArticle', async () => {
    const res = await request.getPageInfo({ board: 'Gamesale', getContent: false, pageLength: 1, lastArticle: '1709052906DF0' });
    assert.deepEqual(res.articles.map(e => e.id), ['17090584977FE'], 'articles\' id not matched');
  });

  it('empty', async () => {
    DOM.innerHTML = '';
    const res = await request.getPageInfo({ board: 'Gamesale', getContent: false, pageLength: 1, pageNum: 99 });
    assert.deepEqual(res.articles, [], 'articles should be empty');
    assert.equal(res.page, 99, 'pageNum not matched');
  });

  it('no page number', () => {
    DOM.getElementById('action-bar-container')?.remove();
    assert.rejects(request.getPageInfo({ board: 'Gamesale', getContent: false, pageLength: 1 }));
  });
});

describe('test getPages', () => {
  before(() => {
    const DOM = parse(pageHTML);
    DOM.querySelector('.r-list-sep')?.remove();
    const pageInfo = [DOM.outerHTML];

    // create prevPage
    const prevIds = ['170910559731E', '1709106845AEF', '1709107480573'];
    DOM.querySelectorAll('#action-bar-container a').forEach((v, i) => {
      const url = v.getAttribute('href')?.replace(/\d+/, n => (+n - 1).toString());
      if (url && i && i < 4) { v.setAttribute('href', url); }
    });
    DOM.querySelectorAll('.title a').forEach((v, i) => {
      const url = v.getAttribute('href')?.replace(/[^/]+$/, `M.${prevIds[i].slice(0, 10)}.A.${prevIds[i].slice(10)}.html`);
      if (url) { v.setAttribute('href', url); }
    });
    pageInfo[1] = DOM.outerHTML;

    // mock fetch response
    const mockCtx = mockedFetch.mock;
    const pattern = /M\.\d{10}\.A\.\w{3}\.html$/;
    mockCtx.mockImplementation(async () => {
      const articleIdx = mockCtx.calls.reduce((acc, v) => (pattern.test(v.arguments[0] as string) ? --acc : acc), mockCtx.callCount());
      return new Response(pageInfo[articleIdx]);
    });
  });
  after(() => { mockedFetch.mock.restore(); });
  afterEach(() => { mockedFetch.mock.resetCalls(); });

  it('common', async () => {
    const res = await request.getPages({ board: 'Gamesale', getContent: true, pageLength: 2 });
    assert.equal(res.length, 2, 'pages\' length not matched');
    assert.deepEqual(res.map(p => p.page), [4014, 4013], 'pages\' num not mathced');
    assert.deepEqual(
      res.flatMap(p => p.articles.map(a => a.id)),
      ['1709059645318', '17090584977FE', '1709052906DF0', '1709107480573', '1709106845AEF', '170910559731E'],
      'articles\' id not matched'
    );
  });

  it('stop by pageLength', async () => {
    let res = await request.getPages({ board: 'Gamesale', getContent: false, pageLength: 0 });
    assert.deepEqual(res, []);

    res = await request.getPages({ board: 'Gamesale', getContent: false, pageLength: 1 });
    assert.equal(res.length, 1, 'pages\' length not matched');
    assert.equal(res[0].page, 4014, 'page\'s num not mathced');
    assert.deepEqual(
      res[0].articles.map(a => a.id),
      ['1709059645318', '17090584977FE', '1709052906DF0'],
      'articles\' id not matched'
    );
  });

  it('response error', () => {
    mockedFetch.mock.mockImplementationOnce(async () => new Response(null, { status: 404 }));
    assert.rejects(request.getArticle('index9000.html', 'abc'));
  });
});
