import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week09.activity'
import { PackageMapper } from './PackageMapper'
import { PredictChecker } from './PredictChecker'
import { SemanticsClassifier } from './SemanticsClassifier'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

describe('Week 9 activities', { timeout: 30000 }, () => {
  it('registers three w09- keys', () => {
    expect(Object.keys(ACTIVITIES)).toEqual(['w09-semantics-classifier', 'w09-package-mapper', 'w09-predict-checker'])
  })

  it('classifier: marks a token, checks, and explains a wrong answer', async () => {
    const user = userEvent.setup()
    render(<Providers><SemanticsClassifier /></Providers>)
    await user.click(screen.getByRole('button', { name: /Token 14: vertiportNetwork on line 40/ }))
    await user.click(screen.getByLabelText(/General definition/))
    await user.click(screen.getByRole('button', { name: 'Check my answers' }))
    expect(screen.getByTestId('w09-semantics-item-feedback').textContent).toMatch(/Not quite.*subsetted feature/)
    expect(screen.getByTestId('w09-semantics-score').textContent).toMatch(/Tokens: 0 of 15/)
  })

  it('mapper: the read-only reference preview maps PHY-003 and flags kinds without a package, and writes nothing', async () => {
    const user = userEvent.setup()
    render(<Providers><PackageMapper /></Providers>)
    expect(screen.getByTestId('w09-mapper-summary').textContent).not.toMatch(/DEC/)
    await user.click(screen.getByLabelText(/Preview with the instructor reference baseline/))
    expect(screen.getByTestId('w09-mapper-summary').textContent).toMatch(/kinds without an L9 package: .*DEC/)
    expect(screen.getByTestId('w09-mapper-rows').textContent).toMatch(/PHY-003Physical<'PHY-003'>/)
    expect(JSON.parse(window.localStorage.getItem('sysml-studio:v1:workspace-model') ?? '{"elements":[]}').elements).toEqual([])
  })

  it('mapper: short-name practice rejects an unquoted hyphenated ID and accepts the quoted one', async () => {
    const user = userEvent.setup()
    render(<Providers><PackageMapper /></Providers>)
    await user.click(screen.getByLabelText(/Preview with the instructor reference baseline/))
    await user.selectOptions(screen.getByLabelText('Element to write'), 'PHY-003')
    await user.type(screen.getByLabelText('Short name as you would write it'), '<PHY-003>')
    expect(screen.getByTestId('w09-shortname-feedback').textContent).toMatch(/must be quoted/)
    await user.clear(screen.getByLabelText('Short name as you would write it'))
    await user.type(screen.getByLabelText('Short name as you would write it'), "<'PHY-003'>")
    expect(screen.getByTestId('w09-shortname-feedback').textContent).toMatch(/Correct form/)
  })

  it('predict: reveal is disabled until a prediction is made, then shows the recorded result', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker /></Providers>)
    const reveal = screen.getByRole('button', { name: 'Reveal the recorded result' })
    expect(reveal).toBeDisabled()
    await user.click(screen.getByLabelText('PASS, no messages'))
    await user.click(reveal)
    await waitFor(() => expect(screen.getByTestId('w09-predict-result').textContent).toMatch(/Recorded result: FAIL/))
    expect(screen.getByTestId('w09-predict-result').textContent).toMatch(/no viable alternative/)
    expect(screen.getByTestId('w09-predict-score').textContent).toMatch(/1 of 8 predicted; 1 revealed with a verified record; of those, 0 exactly right and 0 right on PASS\/FAIL/)
  })

  it('predict (review S9-N1): an unrevealed prediction is never scored, so trying each option cannot leak the key', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker /></Providers>)
    const score = () => screen.getByTestId('w09-predict-score').textContent
    // pc1's recorded outcome is FAIL: syntax. Try every option without revealing: the score never moves.
    for (const label of ['PASS, no messages', 'FAIL: a validation rule', 'FAIL: syntax (does not parse)']) {
      await user.click(screen.getByLabelText(label))
      expect(score()).toMatch(/1 of 8 predicted; 0 revealed with a verified record; of those, 0 exactly right and 0 right on PASS\/FAIL/)
    }
    await user.click(screen.getByRole('button', { name: 'Reveal the recorded result' }))
    await waitFor(() => expect(score()).toMatch(/1 revealed with a verified record; of those, 1 exactly right and 1 right on PASS\/FAIL/))
    expect(screen.getByTestId('w09-predict-result').textContent).toMatch(/Your prediction matches the recorded result/)
  })

  it('predict (review S9-N1): a revealed item whose record does not match the text on screen is not scored', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker hash={() => Promise.resolve('0'.repeat(64))} /></Providers>)
    await user.click(screen.getByLabelText('FAIL: syntax (does not parse)'))
    await user.click(screen.getByRole('button', { name: 'Reveal the recorded result' }))
    await waitFor(() => expect(screen.getByTestId('w09-predict-result').textContent).toMatch(/different version of this text/))
    expect(screen.getByTestId('w09-predict-score').textContent).toMatch(/0 revealed with a verified record; of those, 0 exactly right/)
  })

  it('predict: mutation — while the hash is still being computed, no recorded verdict is shown (fails closed)', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker hash={() => new Promise<string>(() => {})} /></Providers>)
    await user.click(screen.getByLabelText('PASS, no messages'))
    await user.click(screen.getByRole('button', { name: 'Reveal the recorded result' }))
    const box = screen.getByTestId('w09-predict-result')
    expect(box.textContent).toMatch(/Checking that the recorded result belongs/)
    expect(box.textContent).not.toMatch(/Recorded result|no viable alternative|PASS|FAIL/)
  })

  it('predict: mutation — without crypto.subtle (insecure context) the record is reported as unverifiable, not shown', async () => {
    const user = userEvent.setup()
    // what sha256Hex does when crypto.subtle is undefined: the async call rejects with a TypeError
    const noSubtle = async (t: string) => {
      const subtle = (undefined as unknown as SubtleCrypto)
      const buf = await subtle.digest('SHA-256', new TextEncoder().encode(t))
      return String(buf)
    }
    render(<Providers><PredictChecker hash={noSubtle} /></Providers>)
    await user.click(screen.getByLabelText('PASS, no messages'))
    await user.click(screen.getByRole('button', { name: 'Reveal the recorded result' }))
    await waitFor(() => expect(screen.getByTestId('w09-predict-result').textContent).toMatch(/cannot verify that the record belongs/))
    expect(screen.getByTestId('w09-predict-result').textContent).not.toMatch(/Recorded result|no viable alternative/)
  })

  it('classifier: after checking, each token’s accessible name carries the result in words', async () => {
    const user = userEvent.setup()
    render(<Providers><SemanticsClassifier /></Providers>)
    await user.click(screen.getByRole('button', { name: /Token 14: vertiportNetwork on line 40/ }))
    await user.click(screen.getByLabelText(/General definition/))
    await user.click(screen.getByRole('button', { name: /Token 13: vertiportNetwork on line 38/ }))
    await user.click(screen.getByLabelText(/Usage \(declared\)/))
    expect(screen.getByRole('button', { name: /Token 14:/ }).getAttribute('aria-label')).not.toMatch(/checked/)
    await user.click(screen.getByRole('button', { name: 'Check my answers' }))
    expect(screen.getByRole('button', { name: /Token 14:/ }).getAttribute('aria-label')).toMatch(/checked: incorrect$/)
    expect(screen.getByRole('button', { name: /Token 13:/ }).getAttribute('aria-label')).toMatch(/checked: correct$/)
    expect(screen.getByLabelText('SysML v2 listing with selectable tokens').getAttribute('tabindex')).toBe('0')
  })
})
