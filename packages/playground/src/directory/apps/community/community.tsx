import type { FormEvent, ReactElement } from 'react'
import { Button, ScrollArea, Tab, TabList, TabPanel, Tabs, TextBox } from '@murasaki-io/react98'
import { useEffect, useRef, useState } from 'react'
import { assetPath } from '../../../lib/asset-path'
import { ICON } from '../../../lib/icons'

const API_ORIGIN = import.meta.env.VITE_COMMUNITY_API_ORIGIN?.replace(/\/+$/, '') ?? ''
const API = `${API_ORIGIN}/api/community`

interface Entry {
  id: number
  name: string | null
  comment: string
  create_at: string
}

interface GuestbookPage {
  entries: Entry[]
  totalPages: number
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

function Guestbook(): ReactElement {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<GuestbookPage | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const latestEntryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load(): Promise<void> {
      try {
        const guestbook = await fetch(`${API}/guestbook?page=${page}`, { signal: controller.signal }).then(readJson<GuestbookPage>)
        setData(guestbook)
        setError('')
      }
      catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error
            ? err.message
            : 'Unable to load guestbook')
        }
      }
    }
    void load()
    return () => controller.abort()
  }, [page, version])

  useEffect(() => {
    if (data?.entries.length)
      latestEntryRef.current?.scrollIntoView({ block: 'end' })
  }, [data])

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (pending || !name.trim() || !email.trim() || comment.trim().length < 2)
      return
    setPending(true)
    setError('')
    try {
      await readJson(await fetch(`${API}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, comment }),
      }))
      setComment('')
      setPage(1)
      setVersion(value => value + 1)
    }
    catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to send message')
    }
    finally {
      setPending(false)
    }
  }

  function format(event: React.MouseEvent<HTMLButtonElement>, tag: 'B' | 'I' | 'U'): void {
    const textarea = event.currentTarget.form?.querySelector('textarea')
    if (!textarea)
      return
    const { selectionStart: start, selectionEnd: end } = textarea
    const open = `[${tag}]`
    const updated = `${comment.slice(0, start)}${open}${comment.slice(start, end)}[/${tag}]${comment.slice(end)}`
    if (updated.length > 140) {
      setError('Formatting would exceed the 140 character limit')
      return
    }
    setComment(updated)
    setError('')
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + open.length, end + open.length)
    })
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2">
      <ScrollArea className="min-h-0 min-w-0 flex-1 bg-(--window) shadow-(--shadow-sunken)" aria-label="Guestbook messages">
        <div className="min-w-0 max-w-full p-2 text-(--window-text)">
          {!data && !error && <p>Loading messages...</p>}
          {data?.entries.length === 0 && <p>No messages on this page.</p>}
          {data?.entries.map((entry, index) => (
            <div
              key={entry.id}
              ref={index === data.entries.length - 1
                ? latestEntryRef
                : undefined}
              className="mb-3 min-w-0 max-w-full whitespace-pre-wrap [overflow-wrap:anywhere]"
            >
              <div className="mb-1 flex min-w-0 items-center gap-1 text-(--gray-text)">
                <img src={assetPath(ICON.usersGreen.sm)} alt="" className="size-4 shrink-0 pixelated" draggable={false} />
                <strong className="text-(--window-text)">{entry.name || 'Guest'}</strong>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {' — '}
                  {new Date(entry.create_at).toLocaleString()}
                </span>
              </div>
              <FormattedMessage text={entry.comment} />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Newer</Button>
          <span>
            {page}
            {' / '}
            {Math.max(data?.totalPages ?? 1, 1)}
          </span>
          <Button type="button" disabled={!data || page >= data.totalPages} onClick={() => setPage(value => value + 1)}>Older</Button>
        </div>
        <span className="text-(--gray-text)">Guestbook</span>
      </div>
      <form className="flex shrink-0 flex-col gap-1" onSubmit={event => void submit(event)}>
        <div className="grid min-w-0 grid-cols-2 gap-1">
          <TextBox
            aria-label="Your name"
            autoComplete="name"
            maxLength={80}
            placeholder="Your name"
            required
            value={name}
            onValueChange={setName}
            disabled={pending}
            className="min-w-0 w-full"
          />
          <TextBox
            aria-label="Your email"
            autoComplete="email"
            maxLength={254}
            placeholder="Your email"
            required
            type="email"
            value={email}
            onValueChange={setEmail}
            disabled={pending}
            className="min-w-0 w-full"
          />
        </div>
        <p className="text-(--gray-text)">Your email is private and will not appear with your message.</p>
        <div className="flex gap-1">
          {(['B', 'I', 'U'] as const).map(tag => (
            <Button
              key={tag}
              type="button"
              aria-label={{ B: 'Bold', I: 'Italic', U: 'Underline' }[tag]}
              disabled={pending}
              onMouseDown={event => event.preventDefault()}
              onClick={event => format(event, tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
        <TextBox
          multiline
          aria-label="Guestbook message"
          placeholder="Leave a message"
          disabled={pending}
          maxLength={140}
          value={comment}
          onValueChange={setComment}
          onKeyDown={(event) => {
            if (event.ctrlKey && event.key === 'Enter') {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          className="h-16 w-full"
        />
        <div className="flex items-center justify-between">
          <span>
            {comment.length}
            /140
          </span>
          <Button type="submit" disabled={!name.trim() || !email.trim() || pending || comment.trim().length < 2}>
            {pending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
      {error && <p role="alert" className="text-(--window-text)">{error}</p>}
    </div>
  )
}

function FormattedMessage({ text, depth = 0 }: { text: string, depth?: number }): ReactElement {
  if (depth >= 10)
    return <>{text}</>
  const pattern = /\[([BIU]|COLOR|FONT)(?:=([^\]]+))?\]([\s\S]*?)\[\/\1\]/gi
  const nodes: React.ReactNode[] = []
  let end = 0
  for (const match of text.matchAll(pattern)) {
    nodes.push(text.slice(end, match.index))
    const content = <FormattedMessage text={match[3]} depth={depth + 1} />
    const key = match.index
    if (match[1].toUpperCase() === 'B')
      nodes.push(<strong key={key}>{content}</strong>)
    else if (match[1].toUpperCase() === 'I')
      nodes.push(<em key={key}>{content}</em>)
    else if (match[1].toUpperCase() === 'U')
      nodes.push(<u key={key}>{content}</u>)
    else if (match[1].toUpperCase() === 'COLOR')
      nodes.push(<span key={key} style={{ color: match[2] }}>{content}</span>)
    else
      nodes.push(<span key={key} style={{ fontFamily: match[2] }}>{content}</span>)
    end = match.index + match[0].length
  }
  nodes.push(text.slice(end))
  return <>{nodes}</>
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function Chatbot(): ReactElement {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [retryMessages, setRetryMessages] = useState<ChatMessage[] | null>(null)
  const latestMessageRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  useEffect(() => () => requestRef.current?.abort(), [])

  async function send(history: ChatMessage[]): Promise<void> {
    const controller = new AbortController()
    requestRef.current = controller
    setPending(true)
    setError('')
    setRetryMessages(null)
    setMessages(history)
    const id = crypto.randomUUID()
    let content = ''
    try {
      const response = await fetch(`${API}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      })
      if (!response.ok || !response.body)
        throw new Error(`Request failed (${response.status})`)
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      let done = false
      while (!done) {
        const chunk = await reader.read()
        if (chunk.done)
          break
        buffer += chunk.value
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const rawLine of lines) {
          const line = rawLine.trim()
          if (!line.startsWith('data:'))
            continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') {
            done = true
            break
          }
          const event: { choices?: { delta?: { content?: string } }[], error?: { message?: string } } = JSON.parse(data)
          if (event.error)
            throw new Error(event.error.message ?? 'Chat service failed')
          const delta = event.choices?.[0]?.delta?.content
          if (delta) {
            content += delta
            setMessages([
              ...history,
              { id, role: 'assistant', content },
            ])
          }
        }
      }
      if (!done)
        throw new Error('Chat response ended unexpectedly')
    }
    catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error
          ? err.message
          : 'Chat failed')
        setRetryMessages(history)
      }
    }
    finally {
      if (requestRef.current === controller) {
        requestRef.current = null
        setPending(false)
      }
    }
  }

  function submit(event: FormEvent): void {
    event.preventDefault()
    if (pending || !input.trim())
      return
    void send([
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: input.trim(),
      },
    ])
    setInput('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <ScrollArea className="min-h-0 min-w-0 flex-1 bg-(--window) shadow-(--shadow-sunken)" aria-label="Chat messages">
        <div className="min-w-0 max-w-full p-2 text-(--window-text)">
          {messages.length === 0 && <p>Say hello to the chatbot!</p>}
          {messages.map((message, index) => (
            <div
              key={message.id}
              ref={index === messages.length - 1 && !pending
                ? latestMessageRef
                : undefined}
              className="mb-3 min-w-0 max-w-full whitespace-pre-wrap [overflow-wrap:anywhere]"
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <strong>
                  {message.role === 'user'
                    ? 'You'
                    : 'Bot'}
                </strong>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setMessages(items => items.filter(item => item.id !== message.id))
                    setRetryMessages(null)
                    setError('')
                  }}
                >
                  Delete
                </Button>
              </div>
              {message.content}
            </div>
          ))}
          {pending && <p ref={latestMessageRef}>Bot is typing...</p>}
        </div>
      </ScrollArea>
      {error && (
        <div role="alert" className="flex items-center gap-2">
          <span>
            Chat failed:
            {error}
          </span>
          <Button type="button" disabled={!retryMessages} onClick={() => retryMessages && void send(retryMessages)}>Retry</Button>
        </div>
      )}
      <form className="flex items-center gap-2" onSubmit={submit}>
        <TextBox aria-label="Chat message" placeholder="Say something..." maxLength={140} value={input} onValueChange={setInput} disabled={pending} className="min-w-0 flex-1" />
        <span>
          {input.length}
          /140
        </span>
        {pending
          ? <Button type="button" onClick={() => requestRef.current?.abort()}>Stop</Button>
          : <Button type="submit" disabled={!input.trim()}>Send</Button>}
      </form>
    </div>
  )
}

export function Community(): ReactElement {
  return (
    <Tabs defaultValue="guestbook" keepMounted className="h-full min-h-0 w-full p-2">
      <TabList aria-label="Community">
        <Tab value="guestbook">Guestbook</Tab>
        <Tab value="chatbot">Chatbot</Tab>
      </TabList>
      <TabPanel value="guestbook" className="min-h-0">
        <Guestbook />
      </TabPanel>
      <TabPanel value="chatbot" className="min-h-0">
        <Chatbot />
      </TabPanel>
    </Tabs>
  )
}
