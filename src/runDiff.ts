/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { setOutput, setFailed, debug } from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import { diffLines } from 'diff'
import shellParser from 'node-shell-parser'
import asTable from 'as-table'

const START = `Automatically optimizing pages`
const END = '+ First Load JS shared by all'

const cleanOutput = (output: string): string => {
  const start = output.indexOf(START) + START.length
  const end = output.indexOf(END)
  return output.substring(start, end).replace(/^[\r\n.\ ]+|[\r\n.\ ]+$/g, '')
}

export async function runDiff(env?: Partial<NodeJS.ProcessEnv>): Promise<void | string> {
  try {
    env = { ...process.env, ...env }

    const oldBuild = (await fs.readFile(path.join(env.GITHUB_WORKSPACE!, 'old.txt'))).toString()
    debug('old build')
    debug(oldBuild)

    const newBuild = (await fs.readFile(path.join(env.GITHUB_WORKSPACE!, 'new.txt'))).toString()
    debug('new build')
    debug(newBuild)

    const formattedOld = asTable(parseOutput(oldBuild)) + `\n`
    debug(formattedOld)

    const formattedNew = asTable(parseOutput(newBuild)) + '\n'
    debug(formattedNew)

    const changes = diffLines(formattedOld, formattedNew)
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
      output = `**Comparison between main branch and PR:** No change in build output and bundle size`
    } else {
      output = `
**Comparison between main branch and PR:** Change in build output or bundle size detected:

\`\`\`diff
${diff.join('')}
\`\`\``
    }
    setOutput('diff', output)

    return output
  } catch (error) {
    setFailed(error.message)
  }
}

const parseOutput = (output: string) => {
  const result: Array<{
    Page: string
    Size: string
    First: string
    Load: string
    JS: string
  }> = shellParser(cleanOutput(output))

  debug(JSON.stringify(result))

  return result
    .map((resultItem) => ({
      ['  pages']: resultItem?.Page?.replace('┌', '').replace('├', '').replace('└', '').trim(),
      kB: Number(resultItem.Load) || Number(resultItem.Size.replace('kB', '').trim()),
    }))
    .filter((item) => !Number.isNaN(item.kB) && item.kB > 0)
}
