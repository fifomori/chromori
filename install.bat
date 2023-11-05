@echo off

call pnpm i

pushd web
call pnpm i
call pnpm build
popd

pause
