import { Config, ConfigProvider, Context, Effect, Layer } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const experimental = bool("AM_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: bool(name) }).pipe(Config.map((flags) => flags.experimental || flags.enabled))

export class Service extends ConfigService.Service<Service>()("@am/RuntimeFlags", {
  pure: bool("AM_PURE"),
  disableDefaultPlugins: bool("AM_DISABLE_DEFAULT_PLUGINS"),
  enableExa: Config.all({
    experimental,
    enabled: bool("AM_ENABLE_EXA"),
    legacy: bool("AM_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("AM_ENABLE_PARALLEL"),
    legacy: bool("AM_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableQuestionTool: bool("AM_ENABLE_QUESTION_TOOL"),
  experimentalScout: enabledByExperimental("AM_EXPERIMENTAL_SCOUT"),
  experimentalLspTool: enabledByExperimental("AM_EXPERIMENTAL_LSP_TOOL"),
  experimentalPlanMode: enabledByExperimental("AM_EXPERIMENTAL_PLAN_MODE"),
  client: Config.string("AM_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export * as RuntimeFlags from "./runtime-flags"
