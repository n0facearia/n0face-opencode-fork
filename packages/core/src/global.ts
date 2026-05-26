import path from "path"
import fs from "fs/promises"
import { xdgData, xdgCache, xdgConfig, xdgState } from "xdg-basedir"
import os from "os"
import { Context, Effect, Layer } from "effect"
import { Flock } from "./util/flock"
import { Flag } from "./flag/flag"

function appName() {
  return process.env.AM === "1" ? "am" : "opencode"
}

const overrides: Record<string, string | undefined> = {}

const paths = {
  get home() {
    return overrides.home ?? process.env.OPENCODE_TEST_HOME ?? os.homedir()
  },
  set home(v: string) {
    overrides.home = v
  },
  get data() {
    return overrides.data ?? path.join(xdgData!, appName())
  },
  set data(v: string) {
    overrides.data = v
  },
  get bin() {
    return overrides.bin ?? path.join(this.cache, "bin")
  },
  set bin(v: string) {
    overrides.bin = v
  },
  get log() {
    return overrides.log ?? path.join(this.data, "log")
  },
  set log(v: string) {
    overrides.log = v
  },
  get repos() {
    return overrides.repos ?? path.join(this.data, "repos")
  },
  set repos(v: string) {
    overrides.repos = v
  },
  get cache() {
    return overrides.cache ?? path.join(xdgCache!, appName())
  },
  set cache(v: string) {
    overrides.cache = v
  },
  get config() {
    return overrides.config ?? path.join(xdgConfig!, appName())
  },
  set config(v: string) {
    overrides.config = v
  },
  get state() {
    return overrides.state ?? path.join(xdgState!, appName())
  },
  set state(v: string) {
    overrides.state = v
  },
  get tmp() {
    return overrides.tmp ?? path.join(os.tmpdir(), appName())
  },
  set tmp(v: string) {
    overrides.tmp = v
  },
}

export const Path = paths

Flock.setGlobal({ state: Path.state })

await Promise.all([
  fs.mkdir(Path.data, { recursive: true }),
  fs.mkdir(Path.config, { recursive: true }),
  fs.mkdir(Path.state, { recursive: true }),
  fs.mkdir(Path.tmp, { recursive: true }),
  fs.mkdir(Path.log, { recursive: true }),
  fs.mkdir(Path.bin, { recursive: true }),
  fs.mkdir(Path.repos, { recursive: true }),
])

export class Service extends Context.Service<Service, Interface>()("@opencode/Global") {}

export interface Interface {
  readonly home: string
  readonly data: string
  readonly cache: string
  readonly config: string
  readonly state: string
  readonly tmp: string
  readonly bin: string
  readonly log: string
  readonly repos: string
}

export function make(input: Partial<Interface> = {}): Interface {
  return {
    home: Path.home,
    data: Path.data,
    cache: Path.cache,
    config: Flag.OPENCODE_CONFIG_DIR ?? Path.config,
    state: Path.state,
    tmp: Path.tmp,
    bin: Path.bin,
    log: Path.log,
    repos: Path.repos,
    ...input,
  }
}

export const layer = Layer.effect(
  Service,
  Effect.sync(() => Service.of(make())),
)

export const defaultLayer = layer

export const layerWith = (input: Partial<Interface>) =>
  Layer.effect(
    Service,
    Effect.sync(() => Service.of(make(input))),
  )

export * as Global from "./global"
