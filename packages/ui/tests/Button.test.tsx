import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { Button } from '../src'

it('button', async () => {
  const screen = await render(<Button type="primary" />)
  const buttonElement = screen.getByRole('button')

  expect(buttonElement).toBeInTheDocument()
  expect(buttonElement).toHaveTextContent('my button type: primary count: 0')
  expect(screen.container.innerHTML).toMatchInlineSnapshot(
    `"<button class="my-button">my button<br> type: primary<br> count: 0</button>"`,
  )
  expect(buttonElement).toHaveClass('my-button')
})
