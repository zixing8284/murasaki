import type { ReactNode } from 'react'
import { FieldPanel, ThemeProvider } from 'murasaki-react98'

interface ExampleFrameProps {
  title: string
  children: ReactNode
  previewClassName?: string
  source?: string
}

export function ExampleFrame({ title, children, previewClassName, source }: ExampleFrameProps): React.ReactElement {
  const frameClassName = ['m98-example__preview', previewClassName].filter(Boolean).join(' ')

  return (
    <section className="m98-example">
      <h3 className="m98-example__title">{title}</h3>
      <ThemeProvider defaultTheme="windows-98" storageKey={null}>
        <FieldPanel className={frameClassName}>
          {children}
        </FieldPanel>
      </ThemeProvider>
      {source
        ? (
            <pre className="m98-example__source">
              <code>{source.trim()}</code>
            </pre>
          )
        : null}
    </section>
  )
}
