<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:loopkit-rules -->
# Project: DevBoard
Stack: Next.js, React, Node.js.
Layout: `src/` (code), `tests/`, `prisma/`.

## Commands
- `npm run dev` - local server
- `npm run test` - test suite
- `npm run lint` - lint/format

## Conventions
- Match the existing code in the file you're editing. Read it before you write.
- One change, one purpose. No "while I was in there".

## Never
- Edit merged migrations.
- Add a dependency without justifying it in the PR body.
- Mark work done without running the verifier.
<!-- END:loopkit-rules -->
