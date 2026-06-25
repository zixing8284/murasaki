import type { ChangeEvent, ReactElement, RefObject } from 'react'

interface LocalMediaFileInputProps {
  fileInputRef: RefObject<HTMLInputElement | null>
  acceptedMediaTypes: string
  onAddLocalFile: (file: File) => void
}

export function LocalMediaFileInput({
  fileInputRef,
  acceptedMediaTypes,
  onAddLocalFile,
}: LocalMediaFileInputProps): ReactElement {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
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
      aria-label="Add media file"
      onChange={handleFileChange}
    />
  )
}
