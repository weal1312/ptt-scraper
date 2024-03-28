/** Awaited all properties in T  */
export type AwaitedObject<T> = {
  [P in keyof T]: Awaited<T[P]>;
};

/** Pick specific properties in K & P and make specific properties in P optional */
export type PickPartialKey<T, K extends keyof T, P extends Exclude<keyof T, K>> = Pick<T, K> & Partial<Pick<T, P>>;

export interface Article {
  /**
   * @pattern ^\d{10}\w{3}
   */
  id: string;
  /**
   * @maxLength 50
   */
  title: string;
  /**
   * @maxLength 20
   */
  author: string;
  content?: string;
  /**
   * ptt board name
   * @maxLength 10
   */
  board: string;
  createdAt: Date;
}

export interface Task extends Pick<Article, 'board'> {
  /**
   * searching keyword
   * @maxLength 20
   */
  keyword: string;
  getContent: boolean;
  /**
   * @asType integer
   */
  page: number;
  active: boolean;
  updatedAt: Date;
}

export interface ExecuteLog extends Pick<Task, 'board' | 'keyword'> {
  articleCount: number;
  lastArticle?: Article['id'];
  createdAt: Date;
}

declare module 'knex/types/tables.js' {
  interface Tables {
    article: Article;
    task: Task;
    executeLog: ExecuteLog;
  }
}

export interface PageInfo {
  page: number;
  articles: Article[];
}

export interface Option extends PickPartialKey<Task, 'board' | 'getContent', 'keyword'> {
  /**
   * article list number
   * @asType integer
   */
  pageNum?: number;
  /**
   * @asType integer
   */
  pageLength: number;
  lastArticle?: Article['id'];
}
