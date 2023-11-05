@echo off

pnpm i

pushd web
pnpm i
pnpm build
popd

pause
