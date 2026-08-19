import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src'

describe('table', () => {
  it('renders a table inside container panel', async () => {
    const screen = await render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    const table = screen.getByTestId('table')
    expect(table.element().getAttribute('data-slot')).toBe('table')

    const container = screen.container.querySelector('[data-slot="table-container"]')
    expect(container).not.toBeNull()
  })

  it('forwards class names to table and container', async () => {
    const screen = await render(
      <Table
        data-testid="table"
        className="my-table"
        containerClassName="my-container"
      />,
    )

    expect(screen.getByTestId('table').element().className).toContain('my-table')
    const container = screen.container.querySelector('[data-slot="table-container"]') as HTMLElement
    expect(container.className).toContain('my-container')
  })

  it('applies selected row styles', async () => {
    const screen = await render(
      <Table>
        <TableBody>
          <TableRow data-testid="row" selected>
            <TableCell>Item</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByTestId('row').element().className).toContain('bg-(--hot-tracking-color)')
  })

  it('renders table subcomponents with their data-slot attributes', async () => {
    const screen = await render(
      <Table>
        <TableCaption data-testid="caption">Caption</TableCaption>
        <TableHeader data-testid="header">
          <TableRow>
            <TableHead>Head</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="body">
          <TableRow>
            <TableCell>Body</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByTestId('caption').element().getAttribute('data-slot')).toBe('table-caption')
    expect(screen.getByTestId('header').element().getAttribute('data-slot')).toBe('table-header')
    expect(screen.getByTestId('body').element().getAttribute('data-slot')).toBe('table-body')
  })
})
