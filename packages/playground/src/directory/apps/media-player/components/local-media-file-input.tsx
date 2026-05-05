import type { ChangeEvent, JSX, RefObject } from 'react'

interface LocalMediaFileInputProps {
  fileInputRef: RefObject<HTMLInputElement | null>
  acceptedMediaTypes: string
  onAddLocalFile: (file: File) => void
}

export function LocalMediaFileInput({
  fileInputRef,
  acceptedMediaTypes,
  onAddLocalFile,
}: LocalMediaFileInputProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    if (file)
      onAddLocalFile(file)

    event.target.value = ''
  }

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept={acceptedMediaTypes}
      className="hidden"
      onChange={handleChange}
    />
  )
}
