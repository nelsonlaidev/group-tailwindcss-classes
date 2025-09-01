import readline from 'node:readline'

// Define the desired order using regex patterns.
const knownOrderRegex: RegExp[] = [
  /^base$/,
  /^dark:$/,
  /^sm:$/,
  /^md:$/,
  /^lg:$/,
  /^hover:$/,
  /^first:$/,
  /^last:$/,
  /^before:$/,
  /^after:$/,
  /^active:$/,
  /^file:$/,
  /^placeholder:$/,
  /^selection:$/,
  /^focus:$/,
  /^focus-visible:$/,
  /^focus-within:$/,
  /^aria-invalid:$/,
  /^aria-disabled:$/,
  /^disabled:$/,
  /^peer-disabled:$/,
  /^data-\[disabled\]:$/,
  /^data-\[inset\]:$/,
  /^data-\[placeholder\]:$/,
  /^data-\[disabled=true\]:$/,
  /^data-\[selected=true\]:$/,
  /^data-\[active=true\]:$/,
  /^data-\[state=open\]:$/,
  /^data-\[state=closed\]:$/,
  /^data-\[state=checked\]:$/,
  /^data-\[state=unchecked\]:$/,
  /^data-\[state=visible\]:$/,
  /^data-\[state=hidden\]:$/,
  /^data-\[state=collapsed\]:$/,
  /^data-\[state=active\]:$/,
  /^data-\[state=on\]:$/,
  /^data-\[side=top\]:$/,
  /^data-\[side=right\]:$/,
  /^data-\[side=bottom\]:$/,
  /^data-\[side=left\]:$/,
  /^data-\[size=default\]:$/,
  /^data-\[size=sm\]:$/,
  /^data-\[motion\^=from-\]:$/,
  /^data-\[motion\^=to-\]:$/,
  /^data-\[motion=from-start\]:$/,
  /^data-\[motion=from-end\]:$/,
  /^data-\[motion=to-start\]:$/,
  /^data-\[motion=to-end\]:$/,
  /^data-\[orientation=horizontal\]:$/,
  /^data-\[orientation=vertical\]:$/,
  /^data-\[collapsible=offcanvas\]:$/,
  /^data-\[collapsible=icon\]:$/,
  /^data-\[variant=destructive\]:$/,
  /^data-\[variant=inset\]:$/,
  /^data-\[variant=outline\]:$/,
  /^data-\[slot=select-value\]:$/,
  /^data-\[slot=command-input-wrapper\]:$/,
  /^data-\[slot=navigation-menu-link\]:$/,
  /^data-\[panel-group-direction=vertical\]:$/,
  /^data-\[vaul-drawer-direction=top\]:$/,
  /^data-\[vaul-drawer-direction=right\]:$/,
  /^data-\[vaul-drawer-direction=bottom\]:$/,
  /^data-\[vaul-drawer-direction=left\]:$/,
  /^group-data-\[viewport=false\]\/navigation-menu:$/,
  /^group-data-\[disabled=true\]:$/,
  /^group-data-\[side=left\]:$/,
  /^group-data-\[side=right\]:$/,
  /^group-data-\[collapsible=offcanvas\]:$/,
  /^group-data-\[collapsible=icon\]:$/,
  /^group-has-data-\[.*\]:$/,
  /^group-has-data-\[.*\]\/.*:$/,
  /^\*:$/,
  /^\*\*:$/,
  /^has-\[>svg\]:$/,
  /^\[&>svg\]:$/,
  /^\[&_svg\]:$/,
  /^\[&_svg:not\(\[class\*='text-'\]\)\]:$/,
  /^\[&_svg:not\(\[class\*='size-'\]\)\]:$/,
  /^\[&>span:last-child\]:$/,
  /^\[&>.*\]:$/,
  /^\[&.*\]:$/,
  /^\[&.*\]\]:$/
]

/**
 * Extracts the outermost variant prefix from a Tailwind class using pure regex.
 *
 * The regex works as follows:
 * - It starts at the beginning (^) and tries to match a capturing group:
 *   ((?:\[[^\]]*\]|[^:\[])+:)
 *
 *   Here, (?:\[[^\]]*\]|[^:\[])+ means:
 *     - Either match a bracketed segment: \[[^\]]*\]
 *       (this assumes that there is no nested bracket, which is the typical case with Tailwind)
 *     - Or match any character that is neither a colon nor an opening bracket: [^:\[]
 *   The plus quantifier ensures one or more such tokens,
 *   and then a literal colon (:) is required.
 *
 * If no match is found, the function returns "base".
 * @param {string} className The Tailwind class name.
 * @returns {string} The outermost variant prefix (including trailing colon) or "base".
 */
export function getVariantChain(className: string): string {
  const regex = /^((?:\[[^\]]*\]|[^:[])+:)/
  const match = regex.exec(className)
  return match ? match[1]! : 'base'
}

/**
 * Groups Tailwind classes by their variant prefix.
 * Classes sharing the same outermost prefix (e.g. "sm:" from "sm:hover:underline")
 * are concatenated together, preserving their original order.
 * @param {string} input The input string containing Tailwind classes separated by whitespace.
 * @returns {string[]} An array of grouped class strings.
 */
export function groupTailwindClasses(input: string): string[] {
  const classes = input.trim().split(/\s+/)
  const groups = new Map<string, string[]>()
  const order: string[] = []

  // Group classes by their variant prefix.
  for (const cls of classes) {
    const variantChain = getVariantChain(cls)
    if (!groups.has(variantChain)) {
      groups.set(variantChain, [])
      order.push(variantChain)
    }
    groups.get(variantChain)!.push(cls)
  }

  const result: string[] = []
  const matchedKeys = new Set<string>()

  // Process variant keys based on the regex order.
  // For each regex in the known order array, check which grouped keys match.
  for (const pattern of knownOrderRegex) {
    for (const key of order) {
      if (!matchedKeys.has(key) && pattern.test(key)) {
        result.push(groups.get(key)!.join(' '))
        matchedKeys.add(key)
      }
    }
  }

  // Append any unmatched groups in the order they were first encountered.
  for (const key of order) {
    if (!matchedKeys.has(key)) {
      result.push(groups.get(key)!.join(' '))
    }
  }

  return result
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter Tailwind CSS classes:\n> ', (input) => {
  const result = groupTailwindClasses(input)

  console.log(`\
Grouped classes:

{
  ${result.map((line) => `"${line}",`).join('\n')}
}
  `)

  rl.close()
})
