import { useLocal } from "@tui/context/local"
import { DialogSelect } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { CANONICAL_MODES, CANONICAL_MODE_DESCRIPTIONS } from "@/agent/agent"
import { createMemo } from "solid-js"

const modeOrder = CANONICAL_MODES as readonly string[]
const modeDescriptions = CANONICAL_MODE_DESCRIPTIONS

export function DialogModes() {
  const local = useLocal()
  const dialog = useDialog()

  const options = createMemo(() => {
    const all = local.agent.list()
    return modeOrder
      .map((name) => all.find((a) => a.name === name))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .map((agent) => ({
        value: agent.name,
        title: agent.name,
        description: modeDescriptions[agent.name] ?? agent.description,
      }))
  })

  return (
    <DialogSelect
      title="Select mode"
      current={local.agent.current()?.name}
      options={options()}
      onSelect={(option) => {
        local.agent.set(option.value)
        dialog.clear()
      }}
    />
  )
}
