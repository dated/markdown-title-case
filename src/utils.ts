/* Inspired by https://github.com/gouch/to-title-case © 2018 David Gouch */
const toTitleCase = (str: string): string => {
  const smallWords = /^(a|an|and|as|at|but|by|en|for|from|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i
  const alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/
  const wordSeparators = /([ :–—-])/
  const whiteList = ['top', 'autocomplete']

  return str.split(wordSeparators)
    .map((current, index, array) => {
      if (
        // Check for small words
        current.search(smallWords) > -1 &&
        /* Skip first and last word */
        index !== 0 &&
        index !== array.length - 1 &&
        // Ignore title end and subtitle start
        array[index - 3] !== ':' &&
        array[index + 1] !== ':' &&
        // Ignore small words that start a hyphenated phrase
        (array[index + 1] !== '-' ||
          (array[index - 1] === '-' && array[index + 1] === '-'))
      ) {
        return current.toLowerCase()
      }

      // Ignore intentional capitalization
      if (current.substr(1).search(/[A-Z]|\../) > -1) {
        return current
      }

      // Ignore white list
      if (whiteList.includes(current)) {
        return current
      }

      // Avoid uppercasing: 'tmpfs' or anything that doesn't have a vowel
      if (current !== 'my' && !current.match(/[aeiou]/)) {
        return current
      }

      // Ignore URLs
      if (array[index + 1] === ':' && array[index + 2] !== '') {
        return current
      }

      // Avoid uppercasing 'mod_deflate', apt-file
      if (current.match(/.[\_\-:\/\d]./)) {
        return current
      }

      // Avoid uppercasing '`frame`', '/sftp/import'
      if (current.match(/(^[`\/]|[`]$)/)) {
        return current
      }

      // Ignore foo:bar[:taz]
      if (index >= 2 && current.match(/\w+/) && array[index - 1] === ':') {
        return current
      }

      // Capitalize the first letter
      return current.replace(alphanumericPattern, function (match) {
        return match.toUpperCase()
      })
    })
    .join('')
}

const checkForMarker = (line: string): boolean => {
  return line.includes('markdown-title-case: skip-line')
}

export const formatData = (data: string): [string, Record<string, string>[]] => {
  const changes: Record<string, string>[] = []
  let oldTitle: string
  let newTitle: string
  let oldLine: string
  let newLine: string

  const frontMatter = data.split('---')[1]

  if (frontMatter) {
    const matches: (RegExpMatchArray | null) = frontMatter.match(/^(title\s*:\s*)\"?(.+?)\"?[\ \t]*$/im)

    if (matches) {
      oldTitle = matches[2]
      newTitle = toTitleCase(oldTitle).trim()
      oldLine = matches[0]
      newLine = matches[1] + '"' + newTitle + '"'

      if (oldLine !== newLine) {
        changes.push({ old: oldTitle, new: newTitle })
        data = data.replace(oldLine, newLine)
      }
    }
  }

  let matches: (RegExpMatchArray | null) = data.match(/^\#{1,6} ([a-zA-Z0-9\\\[\]\#\-\;\!\?\%\&\;\:\.\/\(\)\ ]+)$/mg)

  if (matches) {
    matches = matches.filter(match => !checkForMarker(match))

    for (const match of matches) {
      const words: string[] = match.split(' ')
      const heading: (string | undefined) = words.shift()
      oldTitle = words.join(' ')
      newTitle = toTitleCase(oldTitle).trim()
      oldLine = heading + ' ' + oldTitle
      newLine = heading + ' ' + newTitle

      if (oldLine !== newLine) {
        changes.push({ old: oldTitle, new: newTitle })
        data = data.replace(oldLine, newLine)
      }
    }
  }

  return [data, changes]
}
