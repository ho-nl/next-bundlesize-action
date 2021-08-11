import path from 'path'
import { runDiff } from '../src/runDiff'

test('creates proper diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, 'fixture'),
  })
  console.log(`\n${diff}`)
})
