---
'lexical-vue': patch
---

Declare `yjs` as an optional peer dependency. The collaboration plugin imports it, but it was only listed under `devDependencies`, which left bundlers no signal to keep it external.
