import globals from 'globals'

const prep_globals = value => Object.fromEntries(value.split(' ').map(name => [name, 'readonly']))
const shared_globals = {
    ...globals.es2021,
    ...globals.browser,
    ...prep_globals('$state $derived $effect $props $bindable $inspect $host'),
}

export default {
    plugins: ['unicorn', 'typescript', 'oxc', 'import'],
    categories: {correctness: 'error'},
    ignorePatterns: [
        ...'node_modules,dist,public,src/lib/components/ui,src/locales'.split(',').map(path => path + '/**/*'),
        'src/lib/utils.ts',
    ],
    overrides: [
        {
            files: ['**/*.js'],
            globals: shared_globals,
        },
        {
            files: ['oxlint.config.js', 'vite.config.js', 'scripts/**/*.js'],
            globals: {...globals.es2021, ...globals.node},
        },
        {
            files: ['**/*.svelte', '**/*.svelte.js'],
            globals: shared_globals,
            rules: {
                'no-inner-declarations': 'off',
                'no-self-assign': 'off',
                'no-unused-expressions': 'off',
                'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
            },
        },
    ],
    jsPlugins: ['eslint-plugin-simple-import-sort'],
    rules: {
        'no-empty': ['error', {allowEmptyCatch: true}],
        'no-undef': 'error',
        'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import-x/first': 'error',
        'import-x/newline-after-import': 'error',
        'import-x/no-duplicates': 'error',
        'import-x/extensions': ['error', 'always', {ignorePackages: true}],
    },
}
