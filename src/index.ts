import { Command, flags } from '@oclif/command'
import * as glob from 'glob'
import { writeFileSync, readFileSync } from 'fs'
import { formatData } from './utils'

class MarkdownTitleCaseCommand extends Command {
  static description = 'describe the command here'

  static flags = {
    fix: flags.boolean({
      description: 'fix the found issues',
      char: 'f',
      default: false
    }),
  }

  static args = [
    { name: 'path' },
  ]

  async run() {
    const { args, flags } = this.parse(MarkdownTitleCaseCommand)

    if (!args.path) {
      this.error('Please provide a path.')
    }

    const pattern: string = args.path + '/**/*.{markdown,md}'

    glob(pattern, (err, globFiles) => {
      if (err) {
        this.error(err)
      }

      let issues = 0

      this.debug(`Found ${globFiles.length} markdown files.`)

      for (const file of globFiles) {
        try {
          const data: string = readFileSync(file, 'utf-8')
          const [ formatted, changes ] = formatData(data)

          if (changes.length) {
            issues = issues + changes.length

            this.warn('Found ' + changes.length + ' issues in ' + file)
            this.log('')
            for (const change of changes) {
              this.log('Line      : ' + change.old)
              this.log('Should be : ' + change.new)
            }
            this.log('')
          }

          if (flags.fix) {
            writeFileSync(file, formatted)
          }
        } catch(e) {
          this.error(e)
        }
      }

      if (issues) {
        this.warn('Found ' + issues + ' issues')
      } else {
        this.warn('No Issues found!')
      }
    })
  }
}

export = MarkdownTitleCaseCommand
