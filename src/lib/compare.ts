// 比較清單：存在 sessionStorage（關掉分頁就清空），最多 3 個。
// 用小型訂閱機制讓「＋比較」按鈕和浮動比較列同步。
import { useEffect, useState } from 'react';
import { KEYS, session } from './store';

export const MAX_COMPARE = 3;
export type CompareKey = string; // 'firm.plan.size'

const listeners = new Set<() => void>();
const read = (): CompareKey[] => session.get<CompareKey[]>(KEYS.compare, []);
const write = (v: CompareKey[]) => {
  session.set(KEYS.compare, v);
  listeners.forEach((f) => f());
};

export const compareKey = (firm: string, plan: string, size: string) => `${firm}.${plan}.${size}`;
export const parseKey = (k: CompareKey) => {
  const [firm, plan, ...rest] = k.split('.');
  return { firm, plan, size: rest.join('.') };
};

export function toggleCompare(k: CompareKey): 'added' | 'removed' | 'full' {
  const cur = read();
  if (cur.includes(k)) {
    write(cur.filter((x) => x !== k));
    return 'removed';
  }
  if (cur.length >= MAX_COMPARE) return 'full';
  write([...cur, k]);
  return 'added';
}
export const setCompare = (v: CompareKey[]) => write(v.slice(0, MAX_COMPARE));

/** 回傳目前比較清單；伺服器端與第一次渲染一律是空的，避免 hydration 不一致 */
export function useCompare(): CompareKey[] {
  const [list, setList] = useState<CompareKey[]>([]);
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    listeners.add(sync);
    window.addEventListener('storage', sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return list;
}

export const compareUrl = (list: CompareKey[]) => `/compare.html${list.length ? '?c=' + list.join(',') : ''}`;
