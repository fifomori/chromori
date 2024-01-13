@echo off

pushd frontend
call pnpm i
call pnpm build
popd

pushd backend
call pnpm i
popd

pause
