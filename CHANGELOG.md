# Changelog

## [1.4.2](https://github.com/mammadataei/cypress-vite/compare/v1.4.1...v1.4.2) (2023-07-15)


### Bug Fixes

* override `ouput.manualChunks` using `false` ([#67](https://github.com/mammadataei/cypress-vite/issues/67)) ([145627a](https://github.com/mammadataei/cypress-vite/commit/145627ab09ed9e43089107126b5319d246eb97f2))

## [1.4.1](https://github.com/mammadataei/cypress-vite/compare/v1.4.0...v1.4.1) (2023-07-05)


### Bug Fixes

* override `rollupOptions.ouput.manualChunks` from the user config ([#58](https://github.com/mammadataei/cypress-vite/issues/58)) ([c38600e](https://github.com/mammadataei/cypress-vite/commit/c38600ec6a56af6e2c614e5532d430f352f3b130))

## [1.4.0](https://github.com/mammadataei/cypress-vite/compare/v1.3.2...v1.4.0) (2023-04-21)


### Features

* allow user to specify full Vite config, not just `configFile` ([#53](https://github.com/mammadataei/cypress-vite/issues/53)) ([293684f](https://github.com/mammadataei/cypress-vite/commit/293684fc092692d247564aada08368ff6bf7de05))


### Bug Fixes

* use chokidar file watcher instead of Vite/Rollup watch ([#50](https://github.com/mammadataei/cypress-vite/issues/50)) ([a2eec1d](https://github.com/mammadataei/cypress-vite/commit/a2eec1d273cda0aa57eb5300804f42033a7e40dc))

## [1.3.2](https://github.com/mammadataei/cypress-vite/compare/v1.3.1...v1.3.2) (2023-04-11)


### Bug Fixes

* fix dist bundle ([#47](https://github.com/mammadataei/cypress-vite/issues/47)) ([ea7015a](https://github.com/mammadataei/cypress-vite/commit/ea7015afc33b58e24066ceec6054cea3aa713e40))

## [1.3.1](https://github.com/mammadataei/cypress-vite/compare/v1.3.0...v1.3.1) (2023-03-02)


### Bug Fixes

* ensure code is finished compiling before returning cached file ([#36](https://github.com/mammadataei/cypress-vite/issues/36)) ([91ae5b8](https://github.com/mammadataei/cypress-vite/commit/91ae5b8bd6f86008570f6e4db542a0ad30725187))

## [1.3.0](https://github.com/mammadataei/cypress-vite/compare/v1.2.1...v1.3.0) (2022-12-24)


### Features

* add support for Vite 4 and Cypress 12 ([#29](https://github.com/mammadataei/cypress-vite/issues/29)) ([00dbb75](https://github.com/mammadataei/cypress-vite/commit/00dbb75efdff30157f721f4f32ba5715c9c23b67))
