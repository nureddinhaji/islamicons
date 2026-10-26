// Stamps a release tag's version into every package before packing. Usage: node scripts/release-version.js <tag> [dir]
// Prints `dist_tag=next` for a pre-release, `dist_tag=latest` otherwise, as its only output (for $GITHUB_OUTPUT).
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const [tag = '', dir = fileURLToPath(new URL('../packages', import.meta.url))] = process.argv.slice(2)

// SemVer 2.0.0 core and pre-release, with no build metadata: npm ignores it, so `1.0.0+a` would collide with `1.0.0+b`.
const IDENTIFIER = '(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)'
const RELEASE_TAG = new RegExp(
    `^v((?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-(${IDENTIFIER}(?:\\.${IDENTIFIER})*))?)$`,
)

const match = RELEASE_TAG.exec(tag)
if (!match) {
    console.error(`release-version: "${tag}" is not a release tag such as v1.0.0 or v1.0.0-beta.1`)
    process.exit(1)
}
const [, version, prerelease] = match

const manifests = readdirSync(dir)
    .map(name => path.join(dir, name, 'package.json'))
    .filter(file => existsSync(file))
    .sort()
if (!manifests.length) {
    console.error(`release-version: no packages in ${dir}`)
    process.exit(1)
}
for (const file of manifests) {
    const manifest = JSON.parse(readFileSync(file, 'utf8'))
    writeFileSync(file, `${JSON.stringify({...manifest, version}, null, 2)}\n`)
    console.error(`release-version: ${manifest.name} ${version}`)
}
console.log(`dist_tag=${prerelease ? 'next' : 'latest'}`)
