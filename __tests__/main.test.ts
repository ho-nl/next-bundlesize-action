import path from 'path'
import { runDiff } from '../src/runDiff'

test('creates proper diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, 'fixture-diff'),
  })
  expect(diff).toMatchInlineSnapshot(`
    "| Page                   | Size old | Size new | Size diff | First load old | First load new | First load diff |
    | ---------------------- | -------- | -------- | --------- | -------------- | -------------- | --------------- |
    | /account/contact       | 7,9kB    | 7,9kB    |           | 254kB          | 253,0kB        | -1kB            |
    | /test/icons            | 6,8kB    |          |           | 209kB          |                | 🗑              |
    | /test/slider           | 1,8kB    | 1,8kB    |           | 235kB          | 249,0kB        | +14kB🚨         |
    | /account/addresses/add |          | 5,3kB    | 🆕        |                | 255,0kB        | 🆕              |
    "
  `)
  console.log(`\n${diff}`)
})

test('creates no diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, 'fixture-same'),
  })
  expect(diff).toMatchInlineSnapshot(`"No change in bundle size detected 🎉"`)
  console.log(`\n${diff}`)
})
