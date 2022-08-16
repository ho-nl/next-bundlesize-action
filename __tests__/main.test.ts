import path from 'path'
import { runDiff } from '../src/runDiff'

test('creates proper diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, 'fixture-diff'),
  })
  expect(diff).toMatchSnapshot()
  console.log(`\n${diff}`)
})


test('creates no diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, 'fixture-same'),
  })
  expect(diff).toMatchSnapshot()
  console.log(`\n${diff}`)
})
