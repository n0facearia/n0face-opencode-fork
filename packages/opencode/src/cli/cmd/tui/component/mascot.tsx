import { Logo } from "@tui/component/logo"
import { useKV } from "@tui/context/kv"
import { builtinMascot } from "@/cli/logo"
import type { LogoShape } from "@tui/component/logo"

export type MascotMode = "idle" | "thinking" | "planning"

export function Mascot(props: { mode: MascotMode; idle?: boolean }) {
  const kv = useKV()

  const shape = () => {
    const stored = kv.get("mascot_data") as Record<MascotMode, LogoShape> | undefined
    if (stored) return stored[props.mode]
    return builtinMascot.shapes[props.mode]
  }

  return <Logo shape={shape()} idle={props.idle ?? true} />
}
