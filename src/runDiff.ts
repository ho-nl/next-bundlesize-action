/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { setOutput, setFailed } from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import { diffLines } from 'diff'

const START = 'Load JS'
const END = '+ First Load JS shared by all'

const cleanOutput = (output: string): string => {
  const start = output.indexOf(START) + START.length
  const end = output.indexOf(END)
  return output.substring(start, end).replace(/^[\r\n]+|[\r\n]+$/g, '')
}

export async function runDiff(env?: Partial<NodeJS.ProcessEnv>): Promise<void> {
  try {
    env = { ...process.env, ...env }

    const oldBuild = (await fs.readFile(path.join(env.GITHUB_WORKSPACE!, 'old.txt'))).toString()
    const newBuild = (await fs.readFile(path.join(env.GITHUB_WORKSPACE!, 'new.txt'))).toString()

    const changes = diffLines(cleanOutput(oldBuild), cleanOutput(newBuild))
    const diff = changes.map(({ added, removed, value }) =>
      value
        .split('\n')
        .map((line) => {
          if (!line) return line
          if (added && removed) return `! ${line}`
          if (added) return `+ ${line}`
          if (removed) return `- ${line}`
          return `# ${line}`
        })
        .join('\n'),
    )

    const hasChanges = changes.some(({ added, removed }) => {
      return added === true || removed === true
    })

    let output = ''
    if (!hasChanges) {
      output = `No change in build output and bundle size`
    } else {
      output = `
Change in build output or bundle size detected:

\`\`\`diff
${diff.join('')}
\`\`\``
    }

    console.log(output)
    setOutput('diff', output)
  } catch (error) {
    setFailed(error.message)
  }
}
