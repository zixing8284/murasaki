import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

interface TableProps extends ComponentProps<'table'> {
  containerClassName?: string
}

export function Table({
  className,
  containerClassName,
  ...props
}: TableProps): React.ReactElement {
  return (
    <div
      data-slot="table-container"
      className={cn('sunken-panel relative overflow-auto', containerClassName)}
    >
      <table
        data-slot="table"
        className={cn(
          'border-collapse relative text-left whitespace-nowrap bg-window-bg w-full',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className,
  ...props
}: ComponentProps<'thead'>): React.ReactElement {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: ComponentProps<'tbody'>): React.ReactElement {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

export function TableFooter({
  className,
  ...props
}: ComponentProps<'tfoot'>): React.ReactElement {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-btn-face font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

export function TableRow({
  className,
  selected,
  ...props
}: ComponentProps<'tr'> & { selected?: boolean }): React.ReactElement {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-menu-hottrack hover:text-menu-hilight-text cursor-pointer transition-colors',
        selected && 'text-menu-hilight-text bg-menu-hottrack',
        '[&_td]:border-b',
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({
  className,
  ...props
}: ComponentProps<'th'>): React.ReactElement {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'sticky top-0 h-4.25 px-grouped-el box-border font-normal bg-btn-face',
        '[box-shadow:var(--shadow-raised)]',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({
  className,
  ...props
}: ComponentProps<'td'>): React.ReactElement {
  return (
    <td
      data-slot="table-cell"
      className={cn('px-grouped-el h-3.5', className)}
      {...props}
    />
  )
}

export function TableCaption({
  className,
  ...props
}: ComponentProps<'caption'>): React.ReactElement {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-1 text-btn-text caption-top', className)}
      {...props}
    />
  )
}
