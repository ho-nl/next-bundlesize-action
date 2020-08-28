/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { setOutput, setFailed, debug } from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import shellParser from 'node-shell-parser'
import tablemark from 'tablemark'
import { merge } from 'lodash'

const START = `Automatically optimizing pages`
const STARTNEW = `Finalizing page optimization...`
const END = '+ First Load JS shared by all'

const cleanOutput = (output: string): string => {
  if (output.includes(START)) {
    return output
      .substring(output.indexOf(START) + START.length, output.indexOf(END))
      .replace(/^[\r\n.\ ]+|[\r\n.\ ]+$/g, '')
  }

  return output
    .substring(output.indexOf(STARTNEW) + STARTNEW.length, output.indexOf(END))
    .replace(/^[\r\n.\ ]+|[\r\n.\ ]+$/g, '')
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

    const formattedOld = (tablemark(parseOutput(oldBuild)) as string) + `\n`
    debug(formattedOld)

    const formattedNew = (tablemark(parseOutput(newBuild, true)) as string) + '\n'
    debug(formattedNew)

    const merged = merge(parseOutput(oldBuild), parseOutput(newBuild, true))

    const formatter = Intl.NumberFormat()
    const res = merged
      .filter((item) => item.New && item.Old)
      .map((item) => {
        if (item.New && item.Old) {
          const diff = item.New - item.Old

          let diffString = ''
          if (diff > -1 && diff < 1) diffString = `☑️  ${formatter.format(diff)}kB`
          if (diff >= 1) diffString = `⚠️  +${formatter.format(diff)}kB`
          if (diff >= 5) diffString = `🚨  +${formatter.format(diff)}kB`
          if (diff <= -1) diffString = `🔥  ${formatter.format(diff)}kB`
          if (diff === 0) diffString = ''

          return {
            ...item,
            Old: `${formatter.format(item['Old'])}kB`,
            New: `${formatter.format(item['New'])}kB`,
            Diff: diffString,
          }
        }
      })

    const table = tablemark(res, { caseHeaders: false })
    setOutput('diff', table)
    return table
  } catch (error) {
    setFailed(error.message)
  }
}

const parseOutput = (output: string, isNew = false) => {
  const result: Array<{
    Page: string
    Size: string
    First: string
    Load: string
    JS: string
  }> = shellParser(cleanOutput(output))

  console.log(result)

  debug(JSON.stringify(result))

  return result.map((resultItem) => {
    const kb = Number(resultItem.Load) || Number(resultItem.Size.replace('kB', '').trim())
    return {
      Page: resultItem?.Page?.replace('┌', '')
        .replace('├', '')
        .replace('└', '')
        .replace('●', '')
        .replace('○', '')
        .replace('λ', '')
        .trim(),
      ...(isNew && { New: kb }),
      ...(!isNew && { Old: kb }),
    }
  })
}
