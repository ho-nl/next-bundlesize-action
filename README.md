# Next bundlesize action

Creates a bundle size report when creating a PR.

## Installation

Add the following to `.github/workflows/bundlesize.yml`

```yml
name: 'bundlesize'
on: # rebuild any PRs and main branch changes
  pull_request:
jobs:
  bundlesize: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          path: new
      - uses: actions/checkout@v2
        with:
          path: old
          ref: master # Change this if you want to compare to a different bundle
      - run: yarn --frozen-lockfile --cwd ./new # install PR depedendencies
      - run: yarn --cwd ./new build > new.txt # build PR branch
      - run: yarn --frozen-lockfile --cwd ./old # install main branch dependencies
      - run: yarn --cwd ./old build > old.txt # build main branch
      - uses: ho-nl/next-bundlesize-action@1.x # create diff markdown
        id: 'bundlesize'
      - uses: unsplash/comment-on-pr@1.x # create comment on PR
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          msg: ${{steps.bundlesize.outputs.diff}}
          check_for_duplicate_msg: true
```

With build env variables:

```yml
name: 'bundlesize'
on: # rebuild any PRs and main branch changes
  pull_request:
jobs:
  bundlesize: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          path: new
      - uses: actions/checkout@v2
        with:
          path: old
          ref: master # Change this if you want to compare to a different bundle
      - run: yarn --frozen-lockfile --cwd ./new # install PR depedendencies
      - run: yarn --cwd ./new build > new.txt # build PR branch
        env:
          GRAPHQL: ${{ secrets.GRAPHQL }} # custom env variable to be able to build nextjs
          GRAPHQL_BEARER: ${{ secrets.GRAPHQL_BEARER }} # custom env variable to be able to build nextjs
      - run: yarn --frozen-lockfile --cwd ./old # install main branch dependencies
      - run: yarn --cwd ./old build > old.txt # build main branch
        env:
          GRAPHQL: ${{ secrets.GRAPHQL }} # custom env variable to be able to build nextjs
          GRAPHQL_BEARER: ${{ secrets.GRAPHQL_BEARER }} # custom env variable to be able to build nextjs
      - uses: ho-nl/next-bundlesize-action@1.x # create diff markdown
        id: 'bundlesize'
      - uses: unsplash/comment-on-pr@1.x # create comment on PR
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          msg: ${{steps.bundlesize.outputs.diff}}
          check_for_duplicate_msg: true
```
