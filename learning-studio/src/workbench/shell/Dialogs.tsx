// Keyboard-shortcuts dialog (`?`) and the dialog frame shared with the course map (CourseMapDialog.tsx, lazy).
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { SHORTCUTS } from '../regions'

export function Frame({ open, onOpenChange, title, children, testid }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; children: ReactNode; testid: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="wb-overlay" />
        <Dialog.Content className="wb-dialog" aria-describedby={undefined} data-testid={testid}>
          <div className="wb-ph" style={{ height: 40 }}>
            <Dialog.Title asChild>
              <h2>{title}</h2>
            </Dialog.Title>
            <span className="wb-sp" />
            <Dialog.Close className="wb-btn ghost icon" aria-label={`Close ${title.toLowerCase()}`}>
              <X size={14} aria-hidden />
            </Dialog.Close>
          </div>
          <div className="p-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Frame open={open} onOpenChange={onOpenChange} title="Keyboard shortcuts" testid="shortcuts-dialog">
      <table className="wb-table">
        <tbody>
          {SHORTCUTS.map(([k, d]) => (
            <tr key={k}>
              <td className="whitespace-nowrap">
                {k.split(' / ').map((x, i) => (
                  <span key={x}>
                    {i > 0 && ' / '}
                    <kbd className="wb-kbd">{x}</kbd>
                  </span>
                ))}
              </td>
              <td>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Frame>
  )
}
