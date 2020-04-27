import path from 'path'
import { runDiff } from '../src/runDiff'

test('creates proper diff', async () => {
  await runDiff({
    HOME: path.join(__dirname, 'fixture'),
  })
})

test('wait 500 ms', async () => {})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {})
