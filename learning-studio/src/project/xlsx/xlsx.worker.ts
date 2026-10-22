// The stakeholder import's parsing worker (spec §j: parsing in a Web Worker in the browser). Receives the file bytes,
// returns the sheets or the error message. No network access is used or needed; the page terminates the worker at the
// time limit (parseInWorker.ts), and the reader also stops itself at its own deadline.
import { readWorkbook } from './reader'

self.onmessage = (e: MessageEvent<{ bytes: ArrayBuffer }>) => {
  const res = readWorkbook(new Uint8Array(e.data.bytes))
  ;(self as unknown as { postMessage: (m: unknown) => void }).postMessage(res)
}
