@echo off

pushd app
pnpm i
popd

pushd web
pnpm i
pnpm build
popd

pause
