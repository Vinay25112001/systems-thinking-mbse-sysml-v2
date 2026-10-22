// Runs the workbook reader in a Web Worker with a hard time limit (the worker is terminated, spec §j.3: 10 s). Where no
// Worker exists (unit tests, very old browsers) the same reader runs in the page with its own deadline. Either way the
// file is read only in this browser: nothing is uploaded until the student approves the mapped records.
import { readWorkbook, XLSX_LIMITS, type WorkbookResult } from './reader'

export async function parseWorkbookFile(file: Blob, timeMs = XLSX_LIMITS.timeMs + 2000): Promise<WorkbookResult> {
  if (file.size > XLSX_LIMITS.maxFileBytes) return { ok: false, error: `The file is ${(file.size / 1048576).toFixed(1)} MB; at most ${XLSX_LIMITS.maxFileBytes / 1048576} MB is accepted.` }
  const bytes = await file.arrayBuffer()
  if (typeof Worker === 'undefined') return readWorkbook(new Uint8Array(bytes))
  let worker: Worker
  try {
    worker = new Worker(new URL('./xlsx.worker.ts', import.meta.url), { type: 'module' })
  } catch {
    return readWorkbook(new Uint8Array(bytes))
  }
  return new Promise<WorkbookResult>((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({ ok: false, error: `Reading the workbook took longer than ${Math.round(timeMs / 1000)} s and was stopped. Nothing was imported.` })
    }, timeMs)
    worker.onmessage = (e: MessageEvent<WorkbookResult>) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(e.data)
    }
    worker.onerror = () => {
      clearTimeout(timer)
      worker.terminate()
      resolve({ ok: false, error: 'The workbook could not be read. Nothing was imported.' })
    }
    worker.postMessage({ bytes }, [bytes])
  })
}

/** SHA-256 of the file (recorded in the provenance; detects a different file with the same name). */
export async function fileSha256(file: Blob): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return null
  const buf = await subtle.digest('SHA-256', await file.arrayBuffer())
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
