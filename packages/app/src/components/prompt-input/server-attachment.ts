import { getFilename } from "@am-ai/core/util/path"
import type { FileSystemContent } from "@am-ai/sdk/v2"

export function serverAttachmentFile(path: string, data: FileSystemContent) {
  const content =
    data.encoding === "utf8" ? data.content : Uint8Array.from(atob(data.content), (char) => char.charCodeAt(0))
  return new File([content], getFilename(path), { type: data.mime })
}
