import clsx from 'clsx'

function Table({ children, className }) {
  return (
    <div className={clsx('overflow-x-auto rounded-xl border dark:border-dark-border border-light-border', className)}>
      <table className="w-full">
        {children}
      </table>
    </div>
  )
}

function TableHeader({ children }) {
  return (
    <thead className="dark:bg-dark-tertiary bg-light-tertiary">
      {children}
    </thead>
  )
}

function TableBody({ children }) {
  return <tbody className="divide-y dark:divide-dark-border divide-light-border">{children}</tbody>
}

function TableRow({ children, className, onClick, selected }) {
  return (
    <tr 
      onClick={onClick}
      className={clsx(
        'transition-colors',
        onClick && 'cursor-pointer',
        selected 
          ? 'dark:bg-accent-primary/10 bg-accent-primary/5' 
          : 'dark:hover:bg-dark-tertiary/50 hover:bg-light-tertiary/50',
        className
      )}
    >
      {children}
    </tr>
  )
}

function TableHead({ children, className }) {
  return (
    <th 
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
        'dark:text-slate-400 text-slate-500',
        className
      )}
    >
      {children}
    </th>
  )
}

function TableCell({ children, className }) {
  return (
    <td className={clsx('px-4 py-3 dark:text-slate-200 text-slate-700', className)}>
      {children}
    </td>
  )
}

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell

export default Table
