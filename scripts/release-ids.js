// Fails a release that removes an icon or category id published in an earlier release of the same major.
// Usage: node scripts/release-ids.js <tag>, after release-version.js has checked the tag.
import {execFileSync} from 'node:child_process'
import {readdirSync, readFileSync} from 'node:fs'

const [tag = ''] = process.argv.slice(2)

const git = (...args) => execFileSync('git', args, {encoding: 'utf8'}).trim()
const core = name => /^v(\d+)\.(\d+)\.(\d+)/.exec(name)?.slice(1).map(Number)
const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
const svg_ids = names => names.filter(name => name.endsWith('.svg')).map(name => name.slice(0, -4))
const category_ids = text => JSON.parse(text).map(category => category.id)

const version = core(tag)
if (!version) {
    console.error(`release-ids: "${tag}" is not a release tag such as v1.0.0`)
    process.exit(1)
}
// A shallow history reaches no earlier tag, so the check would pass without comparing anything.
if (git('rev-parse', '--is-shallow-repository') === 'true') {
    console.error('release-ids: shallow clone: fetch the full history')
    process.exit(1)
}

// Numeric, so v1.10.0 is above v1.9.0; the requested tag is never below itself, even when it already points at HEAD.
const baseline = git('tag', '--merged', 'HEAD', '--list', 'v*')
    .split('\n')
    .filter(name => /^v\d+\.\d+\.\d+$/.test(name) && compare(core(name), version) < 0)
    .sort((a, b) => compare(core(a), core(b)))
    .at(-1)
if (!baseline) {
    console.error(`release-ids: ${tag}: no earlier stable release to compare`)
    process.exit(0)
}

const published = git('ls-tree', '--name-only', baseline, 'icons/')
    .split('\n')
    .map(file => file.slice('icons/'.length))
const kinds = [
    ['icon', svg_ids(published), svg_ids(readdirSync('icons'))],
    [
        'category',
        published.includes('_categories.json') ? category_ids(git('show', `${baseline}:icons/_categories.json`)) : [],
        category_ids(readFileSync('icons/_categories.json', 'utf8')),
    ],
].map(([kind, before, now]) => ({kind, before, removed: before.filter(id => !now.includes(id))}))

console.error(
    `release-ids: ${tag} against ${baseline}: ` +
        kinds.map(({kind, before, removed}) => `${before.length} ${kind} ids, ${removed.length} removed`).join('; '),
)

const new_major = version[0] > core(baseline)[0]
for (const {kind, removed} of kinds.filter(({removed}) => removed.length))
    console.error(
        new_major
            ? `release-ids: warning: ${tag} removes ${kind} ids ${removed.join(', ')}`
            : `release-ids: ${tag} removes ${kind} ids ${removed.join(', ')}: a removed ${kind} id needs a major version`,
    )
process.exit(!new_major && kinds.some(({removed}) => removed.length) ? 1 : 0)
