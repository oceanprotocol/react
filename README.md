[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

<h1 align="center">react</h1>

> 🎣 React hooks & components on top of ocean.js

[![npm](https://img.shields.io/npm/v/@oceanprotocol/react.svg)](https://www.npmjs.com/package/@oceanprotocol/react)
[![Build Status](https://github.com/oceanprotocol/react/workflows/CI/badge.svg)](https://github.com/oceanprotocol/react/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/d3150ecf9468f8238310/maintainability)](https://codeclimate.com/github/oceanprotocol/react/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d3150ecf9468f8238310/test_coverage)](https://codeclimate.com/github/oceanprotocol/react/test_coverage)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-7b1173.svg?style=flat-square)](https://github.com/prettier/prettier)
[![js oceanprotocol](https://img.shields.io/badge/js-oceanprotocol-7b1173.svg)](https://github.com/oceanprotocol/eslint-config-oceanprotocol)

**Table of Contents**

- [🏗 Installation](#-installation)
- [🏄 Quick Start](#-quick-start)
  - [1. Add Provider](#1-add-provider)
  - [2. Use Hooks](#2-use-hooks)
- [📖 Documentation](#-documentation)
- [🦑 Development](#-development)
- [✨ Code Style](#-code-style)
- [👩‍🔬 Testing](#-testing)
- [🛳 Production](#-production)
- [⬆️ Releases](#️-releases)
  - [Production](#production)
  - [Pre-Releases](#pre-releases)
- [📜 Changelog](#-changelog)
- [🎁 Contribute](#-contribute)
- [🧜 Authors](#-authors)
- [🏛 License](#-license)

## 🏗 Installation

```bash
npm install @oceanprotocol/react
```

## 🏄 Quick Start

### 1. Add Provider

First, wrap your whole app with the [`<OceanProvider />`](src/providers/OceanProvider).

### 2. Use Hooks

Then within your component use the included hooks to interact with Ocean's functionality. Each hook can be used independently:

```tsx
import React from 'react'
import {
  useOcean,
  useMetadata,
  useConsume,
  usePublish
} from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  // Get Ocean instance from built-in OceanProvider context
  const { ocean, web3, account } = useOcean()

  // Get metadata for this asset
  const { title, metadata, price } = useMetadata(did)

  // publish asset
  const { publish, publishStep } = usePublish()

  // consume asset
  const { consume, consumeStep } = useConsume()

  async function handleDownload() {
    await consume(did)
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {price}</p>

      <p>Your account: {account}</p>
      <button onClick={handleDownload}>
        {consumeStep || 'Download Asset'}
      </button>
    </div>
  )
}
```

## 📖 Documentation

- [useOcean/OceanProvider](src/providers/OceanProvider/)
- [usePublish](src/hooks/usePublish/)
- [useMetadata](src/hooks/useMetadata/)
- [useConsume](src/hooks/useConsume/)
- [useCompute](src/hooks/useCompute/)

There is also an example app based on Create React App under [`example/`](example/).

## 🦑 Development

The project is authored with TypeScript and compiled with `tsc`.

To start compiler in watch mode:

```bash
npm start
```

## ✨ Code Style

For linting and auto-formatting you can use from the root of the project:

```bash
# auto format all ts & css with eslint & stylelint
npm run lint

# auto format all ts & css with prettier, taking all configs into account
npm run format
```

## 👩‍🔬 Testing

## 🛳 Production

The build script will compile `src/` with [`microbundle`](https://github.com/developit/microbundle) into:

1. CommonJS module
2. ES module
3. UMD build

```bash
npm run build
```

## ⬆️ Releases

Releases are managed semi-automatically. They are always manually triggered from a developer's machine with release scripts.

### Production

From a clean `main` branch you can run any release task bumping the version accordingly based on semantic versioning:

- To bump a patch version: `npm run release`
- To bump a minor version: `npm run release -- minor`
- To bump a major version: `npm run release -- major`

Every task does the following:

- bumps the project version in `package.json`, `package-lock.json`
- auto-generates and updates the CHANGELOG.md file from commit messages
- creates a Git tag
- commits and pushes everything
- creates a GitHub release with commit messages as description
- GitHub release will trigger a GitHub Actions workflow to do a npm release

For the GitHub releases steps a GitHub personal access token, exported as `GITHUB_TOKEN` is required. [Setup](https://github.com/release-it/release-it#github-releases)

### Pre-Releases

Usually from a feature branch you can release a develop version under the `next` npm tag.

Say the current version is at `v1.1.0`, then to publish a pre-release for a next major version `v2.0.0-beta.0`, do:

```bash
npm run release -- major --preRelease=beta --npm.tag=next

# consecutive releases, e.g. to then get `v2.0.0-beta.1`
npm run release -- --preRelease

# final version, e.g. to then get `v2.0.0`
npm run release -- major
```

## 📜 Changelog

See the [CHANGELOG.md](./CHANGELOG.md) file.

## 🎁 Contribute

See the page titled "[Ways to Contribute](https://docs.oceanprotocol.com/concepts/contributing/)" in the Ocean Protocol documentation.

## 🧜 Authors

Created based on the work and learnings of the Ocean Protocol marketplace team:

- [@kremalicious](https://github.com/kremalicious)
- [@maxieprotocol](https://github.com/maxieprotocol)
- [@mihaisc](https://github.com/mihaisc)
- [@unjapones](https://github.com/unjapones)
- [@pfmescher](https://github.com/pfmescher)

## 🏛 License

```text
Copyright ((C)) 2021 Ocean Protocol Foundation Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
