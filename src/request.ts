import { parse } from 'node-html-parser';
import { awaitProps } from './utils.js';
import type { Article, Option, PageInfo } from './types.js';

/**
 * Request Ptt WebPage And Parse DOM
 * @param id
 * @param board
 * @returns
 */
async function request(id: string, board: string) {
  const baseURI = 'https://www.ptt.cc/bbs';
  const url = `${baseURI}/${board}/${id}`;

  const response = await fetch(url, {
    headers: {
      Cookie: 'over18=1',
    },
  });

  if (!response.ok) throw new TypeError(`${response.statusText}: ${response.url}`);
  const data = await response.text();

  return parse(data);
}

/**
 * Get article content
 * @param id
 * @param board
 * @returns
 */
export async function getArticle(id: string, board: string) {
  const document = await request(id, board);
  const text = document.getElementById('main-content')?.textContent;
  const startMatch = text?.match(/時間[\w: ]+\n/s);

  const startIdx = startMatch?.index ? (startMatch[0].length + startMatch.index) : 0;
  const endIdx = text?.indexOf('※ 發信站:');
  return text?.slice(startIdx, endIdx).trim();
}

/**
 * Get article list
 * @param option
 * @returns
 */
export async function getPageInfo(option: Option): Promise<PageInfo> {
  const { board, keyword, pageNum } = option;
  const id = keyword ? 'search?q=' + keyword + '&page=' + String(pageNum ?? 1) : 'index' + String(pageNum ?? '') + '.html';
  const document = await request(id, board);

  let currPage = pageNum;
  // caculate page number by previous page
  if (!currPage) {
    const prevPage = document.querySelector('.btn-group-paging > a:nth-child(2)')
      ?.getAttribute('href')
      ?.match(/(?:index|page=)(\d+)/)?.[1];
    if (!prevPage) throw new Error('cannot get page number');

    currPage = +prevPage + 1;
  }

  // get article title and link
  const $titles = document.querySelectorAll('.r-ent:not(.r-list-sep ~ *):has(.title > a)');
  const requests: Promise<Article>[] = [];
  const headTail = [$titles[0], $titles.at(-1)].map(e => e?.querySelector(':scope .title > a')?.getAttribute('href') ?? '');
  const isAsc = headTail[0] <= headTail[1];

  for (let i = 0; i < $titles.length; i++) {
    // get element desc
    const $el = $titles[isAsc ? $titles.length - i - 1 : i];
    const $linkEl = $el.querySelector(':scope .title > a');
    const matched = $linkEl?.getAttribute('href')?.match(/M\.(\d{10})\.A\.(\w{3})\.html$/);
    if (!matched) throw new TypeError('cannot get article id');

    const articleId = matched[1] + matched[2];
    if ((option.lastArticle ?? '') >= articleId) {
      option.pageLength = 0; // stop scraping
      break;
    }

    requests[i] = awaitProps({
      id: articleId,
      title: $linkEl?.textContent.trim() ?? '',
      author: $el.querySelector(':scope .author')?.textContent.trim() ?? '',
      board,
      content: option.getContent ? getArticle(matched[0], board) : undefined,
      createdAt: new Date(),
    }, 'content');
  }

  return {
    page: currPage,
    articles: await Promise.all(requests),
  };
}

/**
 * Get N-Pages' articles
 * @param option
 * @returns
 */
export async function getPages(option: Option): Promise<PageInfo[]> {
  const pages: (PageInfo | Promise<PageInfo>)[] = [];
  for (let p = 0; p < option.pageLength; p++) {
    if (p === 0) { pages[p] = await getPageInfo(option); }
    else { pages[p] = getPageInfo(option); }
    option.pageNum = (pages[0] as PageInfo).page + (option.keyword ? +(p + 1) : -(p + 1));
  }

  return Promise.all(pages);
}
