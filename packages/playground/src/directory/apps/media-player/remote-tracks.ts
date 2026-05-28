import type { Track } from './media-manager'

interface RemoteTrackSource {
  id: string
  title: string
  artist?: string
  filename: string
}

const VERCEL_BLOB_BASE_URL = 'https://s2jglcbck31odyaw.public.blob.vercel-storage.com'
const TRACK_DIRECTORY = 'tracks'

const REMOTE_TRACKS = [
  {
    id: 'blob-mitose-beryl-wind',
    title: '五月はベリルの风をつれて',
    artist: 'みとせのりこ',
    filename: 'みとせのりこ - 五月はベリルの风をつれて.mp3',
  },
  {
    id: 'blob-faye-wong-eyes-on-me',
    title: 'Eyes On Me',
    artist: '王菲',
    filename: '王菲 - Eyes On Me.mp3',
  },
  {
    id: 'blob-uncle-fixed-music-box',
    title: 'Uncle fixed the music box',
    artist: 'murasaki',
    filename: 'Uncle fixed the music box.mp4',
  },
] as const satisfies readonly RemoteTrackSource[]

function buildBlobTrackUrl(filename: string): string {
  const pathSegments = [TRACK_DIRECTORY, filename]
  const encodedPath = pathSegments.map(segment => encodeURIComponent(segment)).join('/')

  return `${VERCEL_BLOB_BASE_URL}/${encodedPath}`
}

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg'])

export const DEFAULT_REMOTE_PLAYLIST: Track[] = REMOTE_TRACKS.map((track) => {
  const ext = track.filename.slice(track.filename.lastIndexOf('.')).toLowerCase()
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    url: buildBlobTrackUrl(track.filename),
    type: VIDEO_EXTENSIONS.has(ext) ? 'video' : 'audio',
  }
})
