import { Logo } from "@tui/component/logo"
import { catIdle, catThink, catPlan } from "@/cli/logo"
import type { LogoShape } from "@tui/component/logo"

export type MascotMode = "idle" | "thinking" | "planning"

const shapes: Record<MascotMode, LogoShape> = {
  idle: catIdle,
  thinking: catThink,
  planning: catPlan,
}

export function Mascot(props: { mode: MascotMode; idle?: boolean }) {
  const shape = () => shapes[props.mode]
  return (
    <Logo shape={shape()} idle={props.idle ?? true} />
  )
}
