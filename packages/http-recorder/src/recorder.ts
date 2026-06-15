import { Effect, Ref, Schema, Scope } from "effect"
import type * as CassetteService from "./cassette"
import type { CassetteNotFoundError } from "./cassette"
import { SecretFindingSchema } from "./redaction"
import type { CassetteMetadata, Interaction } from "./schema"

export class UnsafeCassetteError extends Schema.TaggedErrorClass<UnsafeCassetteError>()("UnsafeCassetteError", {
  cassetteName: Schema.String,
  findings: Schema.Array(SecretFindingSchema),
}) {
  override get message() {
    return `Refusing to write cassette "${this.cassetteName}" because it contains possible secrets: ${this.findings
      .map((finding) => `${finding.path} (${finding.reason})`)
      .join(", ")}`
  }
}

export type ResolvedMode = "record" | "replay" | "passthrough"

const isCI = () => {
  const value = process.env.CI
  return value !== undefined && value !== "" && value !== "false" && value !== "0"
}

export const resolveAutoMode = (cassette: CassetteService.Interface, name: string): Effect.Effect<ResolvedMode> =>
  Effect.gen(function* () {
    if (isCI()) return "replay"
    return (yield* cassette.exists(name)) ? "replay" : "record"
  })

export const appendOrFail = (
  cassette: CassetteService.Interface,
  name: string,
  interaction: Interaction,
  metadata: CassetteMetadata | undefined,
): Effect.Effect<void, UnsafeCassetteError> =>
  cassette
    .append(name, interaction, metadata)
    .pipe(
      Effect.flatMap(({ findings }) =>
        findings.length === 0 ? Effect.void : Effect.fail(new UnsafeCassetteError({ cassetteName: name, findings })),
      ),
    )

export interface ReplayState<T> {
  readonly load: Effect.Effect<ReadonlyArray<T>, CassetteNotFoundError>
  readonly cursor: Effect.Effect<number>
  readonly advance: Effect.Effect<void>
  readonly claim: <E, R>(
    f: (interaction: T | undefined, index: number, interactions: ReadonlyArray<T>) => Effect.Effect<void, E, R>,
  ) => Effect.Effect<{ readonly interaction: T }, E | CassetteNotFoundError, R>
}

export const makeReplayState = <T>(
  cassette: CassetteService.Interface,
  name: string,
  project: (interactions: ReadonlyArray<Interaction>) => ReadonlyArray<T>,
): Effect.Effect<ReplayState<T>, never, Scope.Scope> =>
  Effect.gen(function* () {
    const load = yield* Effect.cached(cassette.read(name).pipe(Effect.map(project)))
    const position = yield* Ref.make(0)

    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        const used = yield* Ref.get(position)
        if (used === 0) return
        const interactions = yield* load.pipe(Effect.orDie)
        if (used < interactions.length)
          yield* Effect.die(
            new Error(`Unused recorded interactions in ${name}: used ${used} of ${interactions.length}`),
          )
      }),
    )

    return {
      load,
      cursor: Ref.get(position),
      advance: Ref.update(position, (n) => n + 1),
      claim: <E, R>(
        f: (
          interaction: T | undefined,
          index: number,
          interactions: ReadonlyArray<T>,
        ) => Effect.Effect<void, E, R>,
      ) =>
        load.pipe(
          Effect.flatMap((interactions) =>
            Ref.get(position).pipe(
              Effect.flatMap((index) => {
                const interaction = interactions[index]
                return f(interaction, index, interactions).pipe(
                  Effect.flatMap(() =>
                    Ref.update(position, (n) => n + 1).pipe(
                      Effect.as({ interaction: interaction! }),
                    ),
                  ),
                )
              }),
            ),
          ),
        ),
    }
  })
