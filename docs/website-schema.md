# Website structured data

`website/index.html` contains one static JSON-LD graph describing the `WebSite`,
the `SoftwareApplication` and its `Brand`. Stable fragment IDs connect the nodes.
The Wingman `ImageObject` uses the published 512 px PNG, referenced by `logo` on
the brand and `image` on the website and app. It matches the visible header/footer
identity. Existing Open Graph artwork remains the promotional banner.

Schema.org's [logo property](https://schema.org/logo) supports `Brand`, but not
`SoftwareApplication`; use `image` for the latter rather than attaching an invalid
`logo` field or inventing a company. The author is the publicly linked Pengusto
profile. Install links and browser minimums match the visible page. A software
version is deliberately not duplicated because release labels can become stale.

Run `node tests/website-schema.test.mjs`; this also runs in CI. It checks graph
references, the canonical URL, real image dimensions, visible install links and
the absence of unsubstantiated reviews/offers. For vocabulary validation, paste
the JSON-LD script into [Schema.org Validator](https://validator.schema.org/), or
test the deployed homepage. The initial graph passed with zero errors and warnings.

Valid Schema.org data does not imply eligibility for Google software-app rich
results. [Google's requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app)
also require an offer price and a rating/review. The page does not publish those
facts, so they are not fabricated here. Legal pages remain noindex and do not
receive unrelated app markup. Indexing and rich-result display are separate gates.
