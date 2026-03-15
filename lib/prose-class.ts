/**
 * Shared Tailwind prose CSS class string for ReactMarkdown rendering.
 * Used in opportunities/page.tsx, todolist/page.tsx, archive/page.tsx
 */
export const PROSE_CLASS = `prose prose-invert max-w-none text-sm leading-relaxed
  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:tracking-tight
  [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-100 [&_h2]:mt-5 [&_h2]:mb-2.5
    [&_h2]:border-b-2 [&_h2]:border-slate-600 [&_h2]:pb-1.5
  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-4 [&_h3]:mb-1.5
  [&_p]:text-slate-300 [&_p]:leading-7 [&_p]:mb-3
  [&_ul]:text-slate-300 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:mb-3
  [&_ol]:text-slate-300 [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:mb-3
  [&_li]:leading-7
  [&_strong]:text-white [&_strong]:font-bold
  [&_em]:text-slate-300 [&_em]:not-italic [&_em]:font-medium
  [&_code]:bg-slate-700/80 [&_code]:text-amber-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:border [&_code]:border-slate-600/50
  [&_pre]:bg-slate-800 [&_pre]:border [&_pre]:border-slate-600 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-3
  [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-slate-300 [&_pre_code]:text-xs
  [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500/60 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:bg-slate-800/40 [&_blockquote]:py-2 [&_blockquote]:rounded-r
  [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm
  [&_thead]:bg-slate-700/60
  [&_th]:text-slate-200 [&_th]:font-semibold [&_th]:px-4 [&_th]:py-2.5 [&_th]:border [&_th]:border-slate-600 [&_th]:text-left
  [&_td]:text-slate-300 [&_td]:px-4 [&_td]:py-2 [&_td]:border [&_td]:border-slate-700
  [&_tr:nth-child(even)_td]:bg-slate-800/40
  [&_hr]:border-slate-600 [&_hr]:my-4`;
