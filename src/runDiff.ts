import { debug, setOutput, setFailed, getInput } from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import { diffLines } from 'diff'

const START = 'Automatically optimizing pages...'
const END = 'λ  ('

const cleanOutput = (output: string): string => {
  const start = output.indexOf(START) + START.length
  const end = output.indexOf(END)
  return output.substring(start, end).replace(/^[\r\n]+|[\r\n]+$/g, '')
}

export async function runDiff(env?: Partial<NodeJS.ProcessEnv>): Promise<void> {
  try {
    env = { ...process.env, ...env }

    const oldBuild = (await fs.readFile(path.join(env.HOME, 'old.txt'))).toString()
    const newBuild = (await fs.readFile(path.join(env.HOME, 'new.txt'))).toString()

    const changes = diffLines(cleanOutput(oldBuild), cleanOutput(newBuild))
    const output = `\`\`\`diff
${changes
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  .map(({ added, removed, value }) => {
    return (
      value
        .split('\n')
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        .map((line) => {
          if (!line) return line
          if (added && removed) return `! ${line}`
          if (added) return `+ ${line}`
          if (removed) return `- ${line}`
          return `# ${line}`
        })
        .join('\n')
    )
  })
  .join('')}
\`\`\``

    setOutput('msg', output)
  } catch (error) {
    setFailed(error.message)
  }
}
