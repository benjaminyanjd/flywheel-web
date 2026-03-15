/**
 * Shared Tailwind prose CSS class string for ReactMarkdown rendering.
 * Used in opportunities/page.tsx, todolist/page.tsx, archive/page.tsx
 */
export const PROSE_CLASS = `prose max-w-none text-sm leading-relaxed
  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:tracking-tight
  [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-5 [&_h2]:mb-2.5
    [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-1.5
  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mt-4 [&_h3]:mb-1.5
  [&_p]:text-gray-600 [&_p]:leading-7 [&_p]:mb-3
  [&_ul]:text-gray-600 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:mb-3
  [&_ol]:text-gray-600 [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:mb-3
  [&_li]:leading-7
  [&_strong]:text-gray-900 [&_strong]:font-bold
  [&_em]:text-gray-600 [&_em]:not-italic [&_em]:font-medium
  [&_code]:bg-gray-100 [&_code]:text-gray-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:border [&_code]:border-gray-200
  [&_pre]:bg-gray-50 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-3
  [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-gray-700 [&_pre_code]:text-xs
  [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:bg-gray-50 [&_blockquote]:py-2 [&_blockquote]:rounded-r
  [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm
  [&_thead]:bg-gray-50
  [&_th]:text-gray-700 [&_th]:font-semibold [&_th]:px-4 [&_th]:py-2.5 [&_th]:border [&_th]:border-gray-200 [&_th]:text-left
  [&_td]:text-gray-600 [&_td]:px-4 [&_td]:py-2 [&_td]:border [&_td]:border-gray-200
  [&_tr:nth-child(even)_td]:bg-gray-50
  [&_hr]:border-gray-200 [&_hr]:my-4`;
