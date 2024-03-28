import { database } from './database.js';
import { getPages } from './request.js';
import type { Option } from './types.js';

async function main() {
  const client = database();
  await client.transaction(async trx => {
    // get all active task
    const taskOpts: Option[] = await trx('task').where({ active: true })
      .select('board', 'keyword', 'getContent', 'active', {
        pageLength: 'page',
        lastArticle: trx('executeLog')
          .where({
            board: trx.ref('task.board'),
            keyword: trx.ref('task.keyword'),
          }).max('lastArticle')
      });

    // get articles and insert to database
    if (!taskOpts.length) return;
    const results = await Promise.all(
      taskOpts.map((opt, i) => getPages(opt)
        .then(async r => {
          const articles = r.flatMap(p => p.articles);
          if (articles.length) await trx('article').insert(articles).onConflict().ignore();
          return {
            board: taskOpts[i].board,
            keyword: taskOpts[i].keyword,
            articleCount: articles.length,
            lastArticle: articles[0]?.id,
            createdAt: new Date()
          };
        })
      )
    );

    // insert execute log
    return trx('executeLog').insert(results);
  });

  return client.destroy();
}

await main();
