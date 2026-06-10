import { run as runTui, type TuiInput } from "@am-ai/tui"
import { Global } from "@am-ai/core/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}
