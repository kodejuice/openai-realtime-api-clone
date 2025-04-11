> This repo fixes a small issue in the `@streamio/openai-realtime-api` node package that prevented using a custom OpenAI model for the stream call

----

Wrapper for Open AI Realtime API client, that fixes a few issues and allows
using it with Stream Node SDK and Stream Edge Network.

## Installation

```sh
npm install https://github.com/kodejuice/openai-realtime-api-clone
yarn add https://github.com/kodejuice/openai-realtime-api-clone
```

## API

This package is not meant to be used directly. Instead, install it alongside
Stream Node SDK and use the `call.joinOpenAi()` method.

## Build and Release (for Stream developers)

To build for local testing or before publishing:

```sh
yarn run build
```

Publishing is manual for now:

1. Update the version in package.json
2. Build the package with `yarn run build`
3. Pubish to NPM:

   ```sh
   npm publish --access public
   ```
