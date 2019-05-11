import { Command, flags } from '@oclif/command'
import { readFileSync, writeFileSync } from 'fs'
import * as glob from 'glob'

import { formatData } from './utils'

class MarkdownTitleCaseCommand extends Command {
  static description = 'describe the command here'

  static flags = {
    fix: flags.boolean({
      description: 'fix the found issues',
      char: 'f',
      default: false
    }),
    recursive: flags.boolean({
      description: 'also traverse subfolders',
      char: 'r',
      default: false
    })
  }

  static args = [
    { name: 'path' },
  ]

  async run() {
    const { args, flags } = this.parse(MarkdownTitleCaseCommand)

    if (!args.path) {
      this.error('Please provide a path.')
    }

    const pattern = `${args.path}${flags.recursive ? '/**/*.{markdown,md}' : '/*.{markdown,md}'}`

    glob(pattern, (err, globFiles) => {
      if (err) {
        this.error(err)
      }

      let issueCount = 0

      this.debug(`Found ${globFiles.length} markdown files.`)

      for (const file of globFiles) {
        try {
          const data: string = readFileSync(file, 'utf-8')
          const [formatted, changes] = formatData(data)

          if (changes.length) {
            issueCount = issueCount + changes.length

            this.warn('Found ' + changes.length + ' issues in ' + file)
            this.log('')
            for (const change of changes) {
              this.log(`     this line : ${change.old}`)
              this.log(`     should be : ${change.new}\n`)
            }
          }

          if (flags.fix) {
            writeFileSync(file, formatted)
          }
        } catch (e) {
          this.error(e)
        }
      }

      if (issueCount) {
        this.warn(`Found ${issueCount} issues`)
      } else {
        this.warn('No Issues found!')
      }
    })
  }
}

export = MarkdownTitleCaseCommand
