#!/bin/bash

pushd frontend
pnpm i
pnpm build
popd

pushd backend
pnpm i --no-optional
popd
