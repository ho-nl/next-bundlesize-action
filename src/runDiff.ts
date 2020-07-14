/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { setOutput, setFailed, debug } from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import shellParser from 'node-shell-parser'
import tablemark from 'tablemark'
import { merge } from 'lodash'

const START = `Automatically optimizing pages`
const END = '+ First Load JS shared by all'

const cleanOutput = (output: string): string => {
  const start = output.indexOf(START) + START.length
  const end = output.indexOf(END)
  return output.substring(start, end).replace(/^[\r\n.\ ]+|[\r\n.\ ]+$/g, '')
}

const format = Intl.NumberFormat().format

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

    const res = merged
      .filter((item) => item['New (kB)'] && item['Old (kB)'])
      .map((item) => {
        if (item['New (kB)'] && item['Old (kB)']) {
          const diff = item['New (kB)'] - item['Old (kB)']

          let diffString = ''
          if (diff > -1 && diff < 1) diffString = `☑️ ~${format(diff)}`
          if (diff >= 1) diffString = `⚠️ +${format(diff)}`
          if (diff >= 5) diffString = `🚨 +${format(diff)}`
          if (diff <= -1) diffString = `🔥 ${format(diff)}`

          return {
            ...item,
            'Old (kB)': format(item['Old (kB)']),
            'New (kB)': format(item['New (kB)']),
            'Diff (kb)': diffString || '~',
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

  debug(JSON.stringify(result))

  return result.map((resultItem) => {
    const kb = Number(resultItem.Load) || Number(resultItem.Size.replace('kB', '').trim())
    return {
      Page: resultItem?.Page?.replace('┌', '').replace('├', '').replace('└', '').trim(),
      ...(isNew && { 'New (kB)': kb }),
      ...(!isNew && { 'Old (kB)': kb }),
    }
  })
}
