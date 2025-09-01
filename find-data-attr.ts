const findDataAttributes = async (filePath: string): Promise<void> => {
  try {
    const content = await Bun.file(filePath).text()
    const pattern = /data-\[[^\]]+\]/g

    // Get unique matches using Set
    const matches = [...new Set([...content.matchAll(pattern)].map((m) => m[0]))]

    if (matches.length > 0) {
      console.log('Unique matches:')
      for (const [index, match] of matches.entries()) {
        console.log(`${index + 1}: ${match}`)
      }
    } else {
      console.log('No matches found.')
    }
  } catch (error) {
    console.error('Error processing file:', error)
  }
}

await findDataAttributes('index.test.ts')
