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
          'border-collapse relative text-left whitespace-nowrap w-full',
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
      className={cn('[&_tr]:hover:bg-transparent [&_tr]:hover:text-inherit [&_tr]:cursor-default', className)}
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
        'bg-(--window) font-medium [&>tr]:last:border-b-0',
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
        'hover:bg-(--hot-tracking-color) hover:text-(--hilight-text) cursor-pointer',
        selected && 'text-(--hilight-text) bg-(--hot-tracking-color)',
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
        'sticky top-0 h-4.25 px-(--grouped-element-spacing) box-border font-normal bg-(--button-face)',
        'shadow-raised',
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
      className={cn('px-(--grouped-element-spacing) h-3.5', className)}
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
      className={cn('mt-1 text-(--button-text) caption-top', className)}
      {...props}
    />
  )
}
