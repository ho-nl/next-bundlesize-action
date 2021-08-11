/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { setOutput, setFailed, debug } from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import shellParser from 'node-shell-parser'
import tablemark from 'tablemark'
import { merge } from 'lodash'

const START = `Automatically optimizing pages`
const STARTNEW = `Finalizing page optimization`
const END = '+ First Load JS shared by all'

const cleanOutput = (output: string): string => {
  if (output.includes(START)) {
    return output
      .substring(output.indexOf(START) + START.length, output.indexOf(END))
      .replace(/^[\r\n.\ ]+|[\r\n.\ ]+$/g, '')
  }

  if (output.includes(STARTNEW)) {
    return output
      .substring(output.indexOf(STARTNEW) + STARTNEW.length, output.indexOf(END))
      .replace(/^[\r\n.\ ]+|[\r\n.\ ]+$/g, '')
  }

  throw new Error('Ouput START can not be found')
}

export async function runDiff(env?: Partial<NodeJS.ProcessEnv>): Promise<void | string> {
  try {
    env = { ...process.env, ...env }

    const pages = new Set<string>()

    const oldBuild = Object.fromEntries(
      parseOutput((await fs.readFile(path.join(env.GITHUB_WORKSPACE!, 'old.txt'))).toString())
        .filter((p) => p.Old)
        .map((p) => {
          pages.add(p.Page)
          return [p.Page, p.Old ?? 0]
        }),
    )

    const newBuild = Object.fromEntries(
      parseOutput((await fs.readFile(path.join(env.GITHUB_WORKSPACE!, 'new.txt'))).toString(), true)
        .filter((p) => p.New)
        .map((p) => {
          pages.add(p.Page)
          return [p.Page, p.New ?? 0]
        }),
    )

    const formatter = Intl.NumberFormat()
    const res = [...pages.values()].map((page) => {
      console.log(page)
      const Old = oldBuild?.[page]
      const New = newBuild?.[page]

      const diff = (New ?? 0) - (Old ?? 0)

      let diffString = ''
      if (diff > -1 && diff < 1) diffString = `☑️  ${formatter.format(diff)}kB`
      if (diff >= 1) diffString = `⚠️  +${formatter.format(diff)}kB`
      if (diff >= 5) diffString = `🚨  +${formatter.format(diff)}kB`
      if (diff <= -1) diffString = `🔥  ${formatter.format(diff)}kB`
      if (diff === 0) diffString = ''

      return {
        Page: page,
        Old: Old ? `${formatter.format(Old)}kB` : '',
        New: `${formatter.format(New)}kB`,
        Diff: !Old && New ? '🚀' : diffString,
      }
    })

    console.log(res)

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

  return result.map((resultItem) => {
    const kb = Number(resultItem.Load) || Number(resultItem.Size.replace('kB', '').trim())

    let Page = resultItem?.Page?.replace('┌', '')
      ?.replace('├', '')
      ?.replace('└', '')
      ?.replace('●', '')
      ?.replace('○', '')
      ?.replace('λ', '')
      ?.trim()

    const timeStart = Page.indexOf('(')
    if (Page.indexOf('(') > 0) {
      Page = Page.substr(0, timeStart).trim()
    }
    return {
      Page,
      ...(isNew && { New: kb }),
      ...(!isNew && { Old: kb }),
    }
  })
}
