import path from 'path'
import { runDiff } from '../src/runDiff'

test('creates proper diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, 'fixture-diff'),
  })
  expect(diff).toMatchInlineSnapshot(`
    "| Page                   | Size old | Size new | Size diff | First load old | First load new | First load diff |
    | ---------------------- | -------- | -------- | --------- | -------------- | -------------- | --------------- |
    | /account/contact       | 7,9kB    | 7,9kB    |           | 254kB          | 253,0kB        | -1kB            |
    | /test/icons            | 6,8kB    |          |           | 209kB          |                | 🗑              |
    | /test/slider           | 1,8kB    | 1,8kB    |           | 235kB          | 249,0kB        | +14kB🚨         |
    | /account/addresses/add |          | 5,3kB    | 🆕        |                | 255,0kB        | 🆕              |
    "
  `)
  console.log(`\n${diff}`)
})

test('creates no diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, 'fixture-same'),
  })
  expect(diff).toMatchInlineSnapshot(`"No change in bundle size detected 🎉"`)
  console.log(`\n${diff}`)
})

test('creates a diff', async () => {
  const diff = await runDiff({
    GITHUB_WORKSPACE: path.join(__dirname, '13to14'),
  })

  expect(diff).toMatchInlineSnapshot(`
    "| Page                                | Size old | Size new | Size diff | First load old | First load new | First load diff |
    | ----------------------------------- | -------- | -------- | --------- | -------------- | -------------- | --------------- |
    | /                                   | 5,4kB    | 5,4kB    |           | 286kB          | 289,0kB        | +3kB⚠️          |
    | /_app                               |          |          |           | 189kB          | 192,0kB        | +3kB⚠️          |
    | /[...url]                           | 3,1kB    | 3,1kB    |           | 310kB          | 314,0kB        | +4kB⚠️          |
    | /404                                | 6,0kB    | 6,0kB    |           | 237kB          | 240,0kB        | +3kB⚠️          |
    | /account                            | 10,4kB   | 10,5kB   | 0,1kB     | 242kB          | 245,0kB        | +3kB⚠️          |
    | /account/addresses                  | 11,6kB   | 11,7kB   | 0,1kB     | 249kB          | 252,0kB        | +3kB⚠️          |
    | /account/addresses/add              | 7,5kB    | 7,5kB    |           | 267kB          | 271,0kB        | +4kB⚠️          |
    | /account/addresses/edit             | 2,3kB    | 2,3kB    |           | 265kB          | 269,0kB        | +4kB⚠️          |
    | /account/authentication             | 7,6kB    | 7,6kB    |           | 264kB          | 268,0kB        | +4kB⚠️          |
    | /account/contact                    | 7,8kB    | 7,8kB    |           | 264kB          | 268,0kB        | +4kB⚠️          |
    | /account/forgot-password            | 5,2kB    | 5,2kB    |           | 257kB          | 261,0kB        | +4kB⚠️          |
    | /account/name                       | 8,0kB    | 8,0kB    |           | 264kB          | 268,0kB        | +4kB⚠️          |
    | /account/orders                     | 7,2kB    | 7,4kB    | 0,2kB     | 242kB          | 246,0kB        | +4kB⚠️          |
    | /account/orders/view                | 7,5kB    | 7,6kB    | 0,1kB     | 243kB          | 246,0kB        | +3kB⚠️          |
    | /account/reviews                    | 4,9kB    | 5,0kB    | 0,1kB     | 237kB          | 240,0kB        | +3kB⚠️          |
    | /account/reviews/add                | 7,3kB    | 7,4kB    | 0,1kB     | 262kB          | 266,0kB        | +4kB⚠️          |
    | /account/signin                     | 10,6kB   | 10,6kB   |           | 275kB          | 279,0kB        | +4kB⚠️          |
    | /api/graphql                        |          |          |           | 189kB          | 192,0kB        | +3kB⚠️          |
    | /api/preview                        |          |          |           | 189kB          | 192,0kB        | +3kB⚠️          |
    | /blog                               | 1,5kB    | 1,5kB    |           | 287kB          | 290,0kB        | +3kB⚠️          |
    | /blog/[url]                         | 2,1kB    | 2,1kB    |           | 288kB          | 291,0kB        | +3kB⚠️          |
    | /blog/page/[page]                   | 1,5kB    | 1,5kB    |           | 287kB          | 290,0kB        | +3kB⚠️          |
    | /blog/tagged/[url]                  | 2,1kB    | 2,1kB    |           | 288kB          | 291,0kB        | +3kB⚠️          |
    | /c/[...url]                         | 3,1kB    | 3,1kB    |           | 310kB          | 314,0kB        | +4kB⚠️          |
    | /cart                               | 3,4kB    | 3,4kB    |           | 293kB          | 297,0kB        | +4kB⚠️          |
    | /checkout                           | 13,1kB   | 13,1kB   |           | 271kB          | 275,0kB        | +4kB⚠️          |
    | /checkout/added                     | 9,6kB    | 9,6kB    |           | 248kB          | 251,0kB        | +3kB⚠️          |
    | /checkout/customer/addresses/edit   | 7,2kB    | 7,2kB    |           | 265kB          | 269,0kB        | +4kB⚠️          |
    | /checkout/edit/billing-address      | 3,0kB    | 3,0kB    |           | 263kB          | 267,0kB        | +4kB⚠️          |
    | /checkout/payment                   | 13,3kB   | 13,3kB   |           | 286kB          | 290,0kB        | +4kB⚠️          |
    | /checkout/success                   | 5,1kB    | 5,1kB    |           | 289kB          | 293,0kB        | +4kB⚠️          |
    | /checkout/terms/[url]               | 2,8kB    | 2,8kB    |           | 218kB          | 221,0kB        | +3kB⚠️          |
    | /compare                            | 11,5kB   | 11,5kB   |           | 278kB          | 282,0kB        | +4kB⚠️          |
    | /customer/account/createPassword    | 7,1kB    | 7,1kB    |           | 259kB          | 263,0kB        | +4kB⚠️          |
    | /modal/[...url]                     | 8,0kB    | 8,2kB    | 0,2kB     | 268kB          | 271,0kB        | +3kB⚠️          |
    | /newsletter                         | 8,3kB    | 8,3kB    |           | 292kB          | 296,0kB        | +4kB⚠️          |
    | /p/[url]                            | 13,1kB   | 13,1kB   |           | 328kB          | 331,0kB        | +3kB⚠️          |
    | /product/[url]                      | 1,0kB    | 1,0kB    |           | 323kB          | 326,0kB        | +3kB⚠️          |
    | /product/bundle/[url]               | 1,0kB    | 1,0kB    |           | 323kB          | 326,0kB        | +3kB⚠️          |
    | /product/configurable/[url]         | 8,9kB    | 8,9kB    |           | 325kB          | 328,0kB        | +3kB⚠️          |
    | /product/downloadable/[url]         | 1,4kB    | 1,4kB    |           | 323kB          | 326,0kB        | +3kB⚠️          |
    | /product/grouped/[url]              | 1,4kB    | 1,4kB    |           | 323kB          | 326,0kB        | +3kB⚠️          |
    | /product/virtual/[url]              | 1,3kB    | 1,3kB    |           | 323kB          | 326,0kB        | +3kB⚠️          |
    | /products-sitemap.xml               | 0,3kB    | 0,3kB    |           | 189kB          | 192,0kB        | +3kB⚠️          |
    | /search                             | 4,3kB    | 4,3kB    |           | 318kB          | 322,0kB        | +4kB⚠️          |
    | /search/[...url]                    | 4,4kB    | 4,4kB    |           | 318kB          | 322,0kB        | +4kB⚠️          |
    | /service/[[...url]]                 | 8,0kB    | 8,1kB    | 0,1kB     | 268kB          | 271,0kB        | +3kB⚠️          |
    | /switch-stores                      | 7,3kB    | 7,5kB    | 0,2kB     | 223kB          | 226,0kB        | +3kB⚠️          |
    | /test/[[...url]]                    | 4,3kB    | 4,3kB    |           | 242kB          | 245,0kB        | +3kB⚠️          |
    | /test/buttons                       | 7,5kB    | 7,6kB    | 0,1kB     | 214kB          | 217,0kB        | +3kB⚠️          |
    | /test/icons                         | 7,2kB    | 7,4kB    | 0,2kB     | 220kB          | 223,0kB        | +3kB⚠️          |
    | /test/minimal-page-shell/[[...url]] | 8,4kB    | 8,5kB    | 0,1kB     | 215kB          | 218,0kB        | +3kB⚠️          |
    | /test/number-inputs                 | 7,8kB    | 7,8kB    |           | 247kB          | 250,0kB        | +3kB⚠️          |
    | /test/sheet                         | 5,1kB    | 5,1kB    |           | 229kB          | 232,0kB        | +3kB⚠️          |
    | /test/slider                        | 4,1kB    | 4,1kB    |           | 245kB          | 248,0kB        | +3kB⚠️          |
    | /test/typography                    | 7,0kB    | 7,1kB    | 0,1kB     | 213kB          | 216,0kB        | +3kB⚠️          |
    | /test/usebacklink/[[...url]]        | 6,4kB    | 6,5kB    | 0,1kB     | 206kB          | 209,0kB        | +3kB⚠️          |
    | /wishlist                           | 9,4kB    | 9,5kB    | 0,1kB     | 271kB          | 274,0kB        | +3kB⚠️          |
    "
  `)
})
