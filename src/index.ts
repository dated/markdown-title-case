import { Command, flags } from '@oclif/command'

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

    if (args.path && flags.fix) {
      this.log(`you input --fix and --path: ${args.path}`)
    }
  }
}

export = MarkdownTitleCaseCommand
