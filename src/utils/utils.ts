
export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

export function truncate(str: string | null | undefined, n: number, useWordBoundary: boolean): string {
  if (str === null || str === undefined) {
    return '';
  }

  if (str.length <= n) {
    return str;
  }
  const subString = str.slice(0, n - 1); // the original check
  return (useWordBoundary ? subString.slice(0, subString.lastIndexOf(' ')) : subString) + '…';
}
