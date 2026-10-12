import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week10.activity'
import { PredictChecker10 } from './PredictChecker10'
import { RelationClassifier } from './RelationClassifier'
import { ReqTranslator } from './ReqTranslator'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

describe('Week 10 activities', { timeout: 30000 }, () => {
  it('registers three w10- keys', () => {
    expect(Object.keys(ACTIVITIES)).toEqual(['w10-req-translator', 'w10-relation-classifier', 'w10-predict-checker'])
  })

  it('translator: empty workspace says so; practice mode flags a wrong subject and writes nothing', async () => {
    const user = userEvent.setup()
    render(<Providers><ReqTranslator /></Providers>)
    expect(screen.getByTestId('w10-translator-empty')).toBeTruthy()
    await user.click(screen.getByLabelText(/Practise on the instructor reference requirements/))
    await user.selectOptions(screen.getByLabelText('Requirement to translate'), 'REQ-SYS-002')
    await user.type(screen.getByLabelText('Subject name'), 'vertiports')
    await user.type(screen.getByLabelText('Subject type (a definition)'), 'VertiportNetwork')
    expect(screen.getByTestId('w10-translator-checks').textContent).toMatch(/✗ fails — Subject is what the “shall” is about.*EVTOLAircraft/)
    expect(screen.getByTestId('w10-translator-text').textContent).toMatch(/subject vertiports : VertiportNetwork;/)
    expect(JSON.parse(window.localStorage.getItem('sysml-studio:v1:workspace-model') ?? '{"elements":[]}').elements).toEqual([])
  })

  it('classifier: a wrong answer is explained after checking', async () => {
    const user = userEvent.setup()
    render(<Providers><RelationClassifier /></Providers>)
    const radios = screen.getAllByRole('radio', { name: /^satisfy … by …$/ })
    await user.click(radios[3]) // case c4 is evidence, not a satisfy
    await user.click(screen.getByRole('button', { name: 'Check my answers' }))
    expect(screen.getByTestId('w10-rel-feedback-c4').textContent).toMatch(/Not this one.*verification evidence/)
    expect(screen.getByTestId('w10-relations-score').textContent).toMatch(/1 of 10 answered; 0 correct/)
  })

  it('predict: reveal is disabled until a prediction is made, then shows the recorded result', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker10 /></Providers>)
    const reveal = screen.getByRole('button', { name: 'Reveal the recorded result' })
    expect(reveal).toBeDisabled()
    await user.click(screen.getByLabelText('FAIL: a validation rule'))
    await user.click(reveal)
    await waitFor(() => expect(screen.getByTestId('w10-predict-result').textContent).toMatch(/Recorded result: PASS/))
    expect(screen.getByTestId('w10-predict-result').textContent).toMatch(/No messages/)
    expect(screen.getByTestId('w10-predict-score').textContent).toMatch(/1 of 9 predicted; 1 revealed with a verified record; of those, 0 exactly right and 0 right on PASS\/FAIL/)
  })

  it('predict (review W10-F01): an unrevealed prediction is never scored, so trying each option cannot leak the key', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker10 /></Providers>)
    const score = () => screen.getByTestId('w10-predict-score').textContent
    // pc1's recorded outcome is PASS, no messages. Try every option without revealing: the score never moves.
    for (const label of ['FAIL: a validation rule', 'PASS with a warning', 'PASS, no messages']) {
      await user.click(screen.getByLabelText(label))
      expect(score()).toMatch(/1 of 9 predicted; 0 revealed with a verified record; of those, 0 exactly right and 0 right on PASS\/FAIL/)
    }
    await user.click(screen.getByRole('button', { name: 'Reveal the recorded result' }))
    await waitFor(() => expect(score()).toMatch(/1 revealed with a verified record; of those, 1 exactly right and 1 right on PASS\/FAIL/))
  })

  it('predict (review W10-F01): a revealed item whose hash cannot be verified is not scored', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker10 hash={() => Promise.resolve('0'.repeat(64))} /></Providers>)
    await user.click(screen.getByLabelText('PASS, no messages'))
    await user.click(screen.getByRole('button', { name: 'Reveal the recorded result' }))
    await waitFor(() => expect(screen.getByTestId('w10-predict-result').textContent).toMatch(/different version of this text/))
    expect(screen.getByTestId('w10-predict-score').textContent).toMatch(/0 revealed with a verified record; of those, 0 exactly right/)
  })
  it('accessibility: the scrollable listings are keyboard-focusable and named (axe scrollable-region-focusable)', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker10 /></Providers>)
    const pre = screen.getByLabelText(/^Listing for item 1: .+\.sysml$/)
    expect(pre.getAttribute('tabindex')).toBe('0')
    cleanup()
    render(<Providers><ReqTranslator /></Providers>)
    await user.click(screen.getByLabelText(/Practise on the instructor reference requirements/))
    await user.selectOptions(screen.getByLabelText('Requirement to translate'), 'REQ-SYS-002')
    expect(screen.getByTestId('w10-translator-text').getAttribute('tabindex')).toBe('0')
  })
  it('predict: fails closed when the browser cannot compute the hash', async () => {
    const user = userEvent.setup()
    render(<Providers><PredictChecker10 hash={() => Promise.reject(new Error('no crypto.subtle'))} /></Providers>)
    await user.click(screen.getByLabelText('PASS, no messages'))
    await user.click(screen.getByRole('button', { name: 'Reveal the recorded result' }))
    await waitFor(() => expect(screen.getByTestId('w10-predict-result').textContent).toMatch(/cannot compute the SHA-256/))
    expect(screen.getByTestId('w10-predict-result').textContent).not.toMatch(/Recorded result/)
  })
})
