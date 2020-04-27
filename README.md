[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

<h1 align="center">react</h1>

> 🎣 React hooks & components on top of squid.js

[![Build Status](https://travis-ci.com/oceanprotocol/react.svg?token=3psqw6c8KMDqfdGQ2x6d&branch=master)](https://travis-ci.com/oceanprotocol/react)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-7b1173.svg?style=flat-square)](https://github.com/prettier/prettier)
[![js oceanprotocol](https://img.shields.io/badge/js-oceanprotocol-7b1173.svg)](https://github.com/oceanprotocol/eslint-config-oceanprotocol)

---

![iu](https://user-images.githubusercontent.com/90316/80356686-1650c080-887a-11ea-854e-bdc2bbdb0c20.jpeg)

**WE ARE IN HARDWARE MODE. This project is in a conceptual phase and nothing works.**

---

**Table of Contents**

- [🏗 Installation](#-installation)
- [🏄 Usage](#-usage)
- [🦑 Development](#-development)
- [✨ Code Style](#-code-style)
- [👩‍🔬 Testing](#-testing)
- [🛳 Production](#-production)
- [⬆️ Releases](#️-releases)
- [📜 Changelog](#-changelog)
- [🎁 Contribute](#-contribute)
- [🧜 Authors](#-authors)
- [🏛 License](#-license)

## 🏗 Installation

```bash
npm install @oceanprotocol/react
```

## 🏄 Usage

First, wrap your App with the `OceanProvider` and provide its config object:

```tsx
import React from 'react'
import { OceanProvider, Config } from '@oceanprotocol/react'

const config: Config = {
    nodeUri: '',
    ...
}

export default function MyApp({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <OceanProvider config={config}>
      <h1>My App</h1>
      {children}
    </OceanProvider>
  )
}
```

Then within your component use the provided hooks to interact with Ocean's functionality. Each hook can be used independently:

```tsx
import React from 'react'
import { useOcean, useMetadata, useConsume } from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  // Initialize, get existing, or reinitialize Ocean
  const { ocean, account } = useOcean()

  // Get metadata for this asset
  const { title, metadata } = useMetadata(did)

  // publish asset
  const { publish, publishStep } = usePublish()

  // consume asset
  const { consume, consumeStep } = useConsume()

  async function handleClick() {
    await consume(did)
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {metadata.main.price}</p>

      <p>Your account: {account}</p>
      <button onClick={handleClick}>{consumeStep || 'Download Asset'}</button>
    </div>
  )
}
```

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

The build script will compile `src/` with `tsc` into:

1. CommonJS module with ES5 syntax
2. ES module with ES5 syntax

```bash
npm run build
```

## ⬆️ Releases

## 📜 Changelog

See the [CHANGELOG.md](./CHANGELOG.md) file.

## 🎁 Contribute

See the page titled "[Ways to Contribute](https://docs.oceanprotocol.com/concepts/contributing/)" in the Ocean Protocol documentation.

## 🧜 Authors

Created based on the work and learnings of the Ocean Protocol marketplace team:

- [@kremalicious](https://github.com/kremalicious)
- [@maxieprotocol](https://github.com/maxieprotocol)
- [@unjapones](https://github.com/unjapones)
- [@pfmescher](https://github.com/pfmescher)
- [@mihaisc](https://github.com/mihaisc)

## 🏛 License

```text
Copyright 2020 Ocean Protocol Foundation Ltd.

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
