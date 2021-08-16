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
        .filter((p) => p.firstLoad)
        .map((p) => {
          pages.add(p.Page)
          return [p.Page, { firstLoad: p.firstLoad ?? 0, size: p.size ?? 0 }]
        }),
    )

    const newBuild = Object.fromEntries(
      parseOutput((await fs.readFile(path.join(env.GITHUB_WORKSPACE!, 'new.txt'))).toString(), true)
        .filter((p) => p.firstLoad)
        .map((p) => {
          pages.add(p.Page)
          return [p.Page, { firstLoad: p.firstLoad ?? 0, size: p.size ?? 0 }]
        }),
    )

    const formatter = Intl.NumberFormat()
    const formatSize = Intl.NumberFormat(undefined, {
      minimumFractionDigits: 1,
    })
    const res = [...pages.values()].map((page) => {
      const Old = oldBuild?.[page]?.firstLoad
      const oldSize = oldBuild?.[page]?.size
      const New = newBuild?.[page]?.firstLoad
      const newSize = newBuild?.[page]?.size

      return {
        Page: page,
        ['Size old']: oldSize ? `${formatSize.format(oldSize)}kB` : '',
        ['Size new']: newSize ? `${formatSize.format(newSize)}kB` : '',
        ['Size diff']: !oldSize && newSize ? '🚀' : getDiffString(newSize, oldSize, formatSize),
        ['First load old']: Old ? `${formatter.format(Old)}kB` : '',
        ['First load new']: `${formatSize.format(New)}kB`,
        ['First load diff']: !Old && New ? '🚀' : getDiffString(New, Old, formatter),
      }
    })

    const table = tablemark(res, { caseHeaders: false })
    setOutput('diff', table)
    return table
  } catch (error) {
    console.error(error.message)
    setFailed(error.message)
  }

  function getDiffString(New: number, Old: number, formatter: Intl.NumberFormat) {
    const diff = Math.round(((New ?? 0) - (Old ?? 0)) * 10) / 10
    let diffString = ''
    if (diff > -1 && diff < 1) diffString = `${formatter.format(diff)}kB`
    if (diff >= 1) diffString = `⚠️+${formatter.format(diff)}kB`
    if (diff >= 5) diffString = `🚨+${formatter.format(diff)}kB`
    if (diff <= -1) diffString = `☑️${formatter.format(diff)}kB`
    if (diff <= -5) diffString = `🔥${formatter.format(diff)}kB`
    if (diff === 0) diffString = ''
    return diffString
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
    const kb = Number(resultItem.Load) || Number(resultItem.Load.replace('kB', '').trim())
    let sizeKb = Number(resultItem.Size.replace('kB', '').trim())
    const sizeB = Number(resultItem.Size.replace('B', '').trim())

    if (Number.isNaN(sizeKb) && Number.isFinite(sizeB)) {
      sizeKb = sizeB / 1024
    }
    sizeKb = Math.round(sizeKb * 10) / 10

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
      ...(isNew && { firstLoad: kb, size: sizeKb }),
      ...(!isNew && { firstLoad: kb, size: sizeKb }),
    }
  })
}
