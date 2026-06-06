# AM — opencode ultimate fork

The ultimate feature fork of [OpenCode](https://github.com/sst/opencode) — the open source AI coding agent — with 10 custom agent modes, animated mascot, tabbed views, and project setup commands.

---

## One-Command Install

```bash
curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
```

Run this in any project directory to install the custom mode system. It creates:

```
.am/
├── design.mode.md      # UI/UX design system prompt
├── cleanup.mode.md     # Code quality system prompt
└── security.mode.md    # Security audit system prompt

.opencode/agent/
├── design.md           # Design agent config
├── cleanup.md          # Cleanup agent config
└── security.md         # Security agent config
 curl -fsSL https://raw.githubusercontent.com/n0facearia/n0face-opencode-fork/main/install.sh | bash
bash: line 10: BASH_SOURCE[0]: unbound variable
bash: line 10: cd: null directory

  ┌─ AM Installer ──────────────────────────────────────────┐
  │                                                          │
  │  Installs AM CLI + 10-mode agent system:                 │
  │  manager, design, frontend, backend, database,           │
  │  cleanup, security, testing, devops, documentation       │
  └──────────────────────────────────────────────────────────┘

Building AM from source...
  git: git version 2.54.0
  bun: 1.3.14
Cloning repository...
Cloning into '/tmp/tmp.notuJNv7UX'...
remote: Enumerating objects: 5558, done.
remote: Counting objects: 100% (5558/5558), done.
remote: Compressing objects: 100% (4627/4627), done.
remote: Total 5558 (delta 761), reused 4602 (delta 737), pack-reused 0 (from 0)
Receiving objects: 100% (5558/5558), 50.75 MiB | 291.00 KiB/s, done.
Resolving deltas: 100% (761/761), done.
Installing dependencies...
bun install v1.3.14 (0d9b296a)
522 |     "packages/plugin": {
          ^
warn: Duplicate key "packages/plugin" in object literal
   at bun.lock:522:5

574 |     "packages/sdk/js": {
          ^
warn: Duplicate key "packages/sdk/js" in object literal
   at bun.lock:574:5

494 |     "packages/plugin": {
          ^
error: Duplicate workspace name: '@am-ai/plugin'
    at bun.lock:494:5
InvalidWorkspaceObject: failed to parse lockfile: 'bun.lock'

warn: Ignoring lockfile
warn: incorrect peer dependency "@stripe/stripe-js@8.6.1"

warn: incorrect peer dependency "react@18.2.0"

warn: incorrect peer dependency "react-dom@18.2.0"

warn: incorrect peer dependency "solid-js@1.9.10"

warn: incorrect peer dependency "effect@4.0.0-beta.66"

+ @actions/artifact@5.0.1
+ @tsconfig/bun@1.0.9
+ @types/mime-types@3.0.1
+ @typescript/native-preview@7.0.0-dev.20251207.1
+ glob@13.0.5 (v13.0.6 available)
+ husky@9.1.7
+ oxlint@1.60.0 (v1.67.0 available)
+ oxlint-tsgolint@0.21.0 (v0.23.0 available)
+ prettier@3.6.2 (v3.8.3 available)
+ semver@7.8.1
+ sst@3.18.10 (v4.14.3 available)
+ turbo@2.8.13 (v2.9.15 available)
+ @aws-sdk/client-s3@3.933.0 (v3.1053.0 available)
+ heap-snapshot-toolkit@1.1.3
+ typescript@5.8.2 (v6.0.3 available)

4570 packages installed [351.06s]
Building binary (may take a few minutes)...
$ bun run script/build.ts --single --skip-install
opencode script {
  "channel": "main",
  "version": "0.0.0-main-202605311303",
  "preview": true,
  "release": false,
  "team": [
    "adamdotdevin",
    "Brendonovich",
    "fwang",
    "Hona",
    "iamdavidhill",
    "jayair",
    "jlongster",
    "kitlangton",
    "kommander",
    "MrMushrooooom",
    "nexxeln",
    "R44VC0RP",
    "rekram1-node",
    "thdxr",
    "simonklee",
    "vimtor",
    "actions-user",
    "opencode",
    "opencode-agent[bot]"
  ]
}
Generated models-snapshot.js
Loaded 20 migrations
Building Web UI to embed in the binary
$ vite build
vite v7.1.4 building for production...
transforming...
✓ 20 modules transformed.
✗ Build failed in 939ms
error during build:
[@tailwindcss/vite:generate:build] Can't resolve '@opencode-ai/ui/styles/tailwind' in '/tmp/tmp.notuJNv7UX/packages/app/src'
file: /tmp/tmp.notuJNv7UX/packages/app/src/index.css
    at finishWithoutResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:942:18)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1034:14
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5
    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:15:1)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5
    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:27:1)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFilePlugin.js:94:43
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5
    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:15:1)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5
    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:15:1)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5
    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:42:1)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ConditionalPlugin.js:53:42
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5
    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:16:1)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:39:13
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesUtils.js:123:12
    at SyncAsyncFileSystemDecorator.stat (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/SyncAsyncFileSystemDecorator.js:66:34)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesUtils.js:99:7
    at next (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:35:3)
    at forEachBail (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:49:9)
    at modulesResolveHandler (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesUtils.js:91:2)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesInHierarchicalDirectoriesPlugin.js:36:6
    at _next0 (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:8:1)
    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:30:1)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/SelfReferencePlugin.js:102:13
    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:22:1)
    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ConditionalPlugin.js:42:14
    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:37:1)
    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/NextPlugin.js:30:14
    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:7:1)
    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/NextPlugin.js:30:14
    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:7:1)
    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFilePlugin.js:85:17
    at onLevelDone (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:186:22)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:39:13
    at onJson (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:117:4)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:144:5
    at SyncAsyncFileSystemDecorator.readJson (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/SyncAsyncFileSystemDecorator.js:204:6)
    at iterFilename (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:125:24)
    at next (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:35:3)
    at forEachBail (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:49:9)
    at findDescriptionFile (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:199:3)
    at onLevelDone (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:192:10)
    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:39:13
error: script "build" exited with code 1
56 |
57 | const createEmbeddedWebUIBundle = async () => {
58 |   console.log(`Building Web UI to embed in the binary`)
59 |   const appDir = path.join(import.meta.dirname, "../../app")
60 |   const dist = path.join(appDir, "dist")
61 |   await $`bun run --cwd ${appDir} build`
                    ^
ShellError: Failed with exit code 1
 exitCode: 1,
   stdout: "vite v7.1.4 building for production...\ntransforming...\n✓ 20 modules transformed.\n",
   stderr: "$ vite build\n✗ Build failed in 939ms\nerror during build:\n[@tailwindcss/vite:generate:build] Can't resolve '@opencode-ai/ui/styles/tailwind' in '/tmp/tmp.notuJNv7UX/packages/app/src'\nfile: /tmp/tmp.notuJNv7UX/packages/app/src/index.css\n    at finishWithoutResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:942:18)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1034:14\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5\n    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:15:1)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5\n    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:27:1)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFilePlugin.js:94:43\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5\n    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:15:1)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5\n    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:15:1)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5\n    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:42:1)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ConditionalPlugin.js:53:42\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1111:5\n    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:16:1)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:39:13\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesUtils.js:123:12\n    at SyncAsyncFileSystemDecorator.stat (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/SyncAsyncFileSystemDecorator.js:66:34)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesUtils.js:99:7\n    at next (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:35:3)\n    at forEachBail (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:49:9)\n    at modulesResolveHandler (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesUtils.js:91:2)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ModulesInHierarchicalDirectoriesPlugin.js:36:6\n    at _next0 (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:8:1)\n    at eval (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:30:1)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/SelfReferencePlugin.js:102:13\n    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:22:1)\n    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/ConditionalPlugin.js:42:14\n    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:37:1)\n    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/NextPlugin.js:30:14\n    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:7:1)\n    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/NextPlugin.js:30:14\n    at Hook.eval [as callAsync] (eval at create (/tmp/tmp.notuJNv7UX/node_modules/.bun/tapable@2.3.3/node_modules/tapable/lib/HookCodeFactory.js:31:10), <anonymous>:7:1)\n    at Resolver.doResolve (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/Resolver.js:1108:16)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFilePlugin.js:85:17\n    at onLevelDone (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:186:22)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:39:13\n    at onJson (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:117:4)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:144:5\n    at SyncAsyncFileSystemDecorator.readJson (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/SyncAsyncFileSystemDecorator.js:204:6)\n    at iterFilename (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:125:24)\n    at next (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:35:3)\n    at forEachBail (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:49:9)\n    at findDescriptionFile (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:199:3)\n    at onLevelDone (/tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/DescriptionFileUtils.js:192:10)\n    at /tmp/tmp.notuJNv7UX/node_modules/.bun/enhanced-resolve@5.22.0/node_modules/enhanced-resolve/lib/forEachBail.js:39:13\nerror: script \"build\" exited with code 1\n",

      at ShellPromise (unknown:75:16)
      at BunShell2 (unknown:191:36)
      at /tmp/tmp.notuJNv7UX/packages/opencode/script/build.ts:61:9

Bun v1.3.14 (Linux x64)
error: script "build" exited with code 1
Failed to build AM
Check the error output above for details.
TUTORIAL.md             # This file
```

Press **Tab** in OpenCode to cycle through all modes.

---

## Manual Install (Full Fork)

If you want the TUI modifications too (mascot, tabbed views, home screen):

```bash
git clone https://github.com/n0facearia/n0face-opencode-fork.git
cd n0face-opencode-fork/packages/opencode
npm i -g bun
bun install
bun run build
```

Then run `am` from anywhere.

---

## What's Different From Upstream

| Feature | Upstream OpenCode | This Fork |
|---------|------------------|-----------|
| **Agent modes** | plan, build | plan, build, **design, cleanup, security** |
| **TUI Mascot** | None | Animated cat sprites |
| **Message tabs** | None | Result / Thinking toggle |
| **Home screen** | Single column | Three-column layout |
| **Mode prompts** | 2 built-in | 5 modes with system prompts |
| **Setup commands** | None | `/new-project`, `/continue-project` |
| **Install script** | `curl opencode.ai/install` | `curl raw.githubusercontent.com/...` |

### Custom Agents

| Agent | Color | Purpose |
|-------|-------|---------|
| **design** | Purple `#A855F7` | UI/UX audit, accessibility, animations |
| **cleanup** | Green `#22C55E` | Code quality, dead code, performance |
| **security** | Red `#EF4444` | Vulnerability scan, dependency audit |

### Custom Commands

| Command | Description |
|---------|-------------|
| `/new-project` | Set up a new project with mode system |
| `/continue-project` | Import mode system into existing project |

---

## Tutorial

### Starting am

```bash
am
```

### Switching Modes

Press **Tab** to cycle forward or **Shift+Tab** to cycle backward through:

```
plan → build → design → cleanup → security
```

Each mode changes the AI agent's focus and permissions.

### Mode Descriptions

#### Plan Mode
Read-only analysis and architecture planning. Cannot edit files. Use for:
- Exploring unfamiliar codebases
- Planning architecture changes
- Auditing project structure

#### Build Mode
Full-access development — the default agent. Use for:
- Writing code and tests
- Running commands
- Making any project changes

#### Design Mode
Focuses on UI/UX, accessibility, animations, and visual systems. Use for:
- Running a full UI audit (`/audit`)
- Checking WCAG compliance (`/accessibility`)
- Improving component design (`/components`)
- Previewing design system (`/preview`)

Commands: `/audit`, `/system`, `/accessibility`, `/animations`, `/components`, `/fix`, `/preview`, `/status`

#### Cleanup Mode
Focuses on code quality, removing dead code, and performance optimization. Use for:
- Running a code cleanup analysis (`/cleanup`)
- Finding dead code (`/dead-code`)
- Performance optimization (`/performance`)
- Refactoring suggestions (`/refactor`)

Commands: `/cleanup`, `/dead-code`, `/performance`, `/refactor`, `/fix`, `/metrics`, `/status`

#### Security Mode
Focuses on vulnerability scanning, dependency auditing, and security hardening. Use for:
- Running a full security audit (`/audit`)
- Viewing critical issues only (`/critical`)
- Generating a security report (`/report`)

Commands: `/audit`, `/critical`, `/fix`, `/report`, `/status`

### The Mascot

The cat sprite in the TUI changes based on state:

```
Normal (idle)      Thinking (busy)     Planning mode
┌───────┐          ┌───────┐           ┌───────┐
│ ~ _ ~ │          │ ^ _ ^ │           │  ███  │
└───────┘          └───────┘           └───────┘
```

- **Normal**: Cat with sleepy eyes — waiting for your input
- **Thinking**: Cat with alert eyes — model is streaming or executing tools
- **Planning**: Cat with sunglasses — Plan mode is active

### Tabbed Message Views

In the session header, click **Result** or **Thinking** to toggle between:
- **Result**: Shows the model's text responses and tool outputs
- **Thinking**: Shows the model's reasoning/internal thoughts

### Setting Up a New Project

```bash
cd ~/my-new-project
am
```

Then in am:

```
/new-project
```

The command asks for:
1. Project name
2. Project type (web, api, cli, etc.)
3. Technology stack
4. Description

It creates `PROJECT_SUMMARY.md`, `MODE_CONTEXT.md`, `.am/`, and `.opencode/agent/`.

### Importing Into an Existing Project

```bash
cd ~/my-existing-project
am
```

Then in am:

```
/continue-project
```

This auto-detects your project's name, type, and stack from `package.json`, `Cargo.toml`, `go.mod`, etc., and creates the mode system files without overwriting anything that already exists.

### Result/Thinking Tabs

Each assistant message has two views:
- **Result** (default) — shows the model's reply and tool outputs
- **Thinking** — shows reasoning/scratchpad content (if available)

---

## Project File Reference

| File | Purpose |
|------|---------|
| `.am/design.mode.md` | System prompt for Design mode |
| `.am/cleanup.mode.md` | System prompt for Cleanup mode |
| `.am/security.mode.md` | System prompt for Security mode |
| `.opencode/agent/design.md` | Agent config: frontmatter + prompt body |
| `.opencode/agent/cleanup.md` | Agent config: frontmatter + prompt body |
| `.opencode/agent/security.md` | Agent config: frontmatter + prompt body |
| `PROJECT_SUMMARY.md` | Project-wide status tracking across all modes |
| `MODE_CONTEXT.md` | Mode system reference |

---

## Agent Config Format

Each agent file in `.opencode/agent/` has YAML frontmatter followed by the system prompt body:

```markdown
---
mode: primary
hidden: false
color: "#A855F7"
description: UI/UX design agent
---

Full system prompt here...
```

| Field | Description |
|-------|-------------|
| `mode` | Agent role: `primary` (toggleable), `subagent` (internal), `all` (both) |
| `hidden` | `true` hides from Tab cycling |
| `color` | Hex color or theme color name |
| `description` | Shown in agent selector |
| (body) | System prompt used when this mode is active |

---

## Uninstalling

To remove the custom mode system from a project:

```bash
rm -rf .am .opencode/agent/design.md .opencode/agent/cleanup.md .opencode/agent/security.md
rm -f PROJECT_SUMMARY.md MODE_CONTEXT.md TUTORIAL.md
```
