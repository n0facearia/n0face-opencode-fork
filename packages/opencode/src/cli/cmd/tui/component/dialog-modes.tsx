import { useLocal } from "@tui/context/local"
import { DialogSelect } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { createMemo } from "solid-js"

const modeDescriptions: Record<string, string> = {
  start: "New project intake and orchestration",
  "frontend-mode": "Design system + UI implementation",
  "backend-mode": "Backend, database, security, CI/CD, docs",
  "test-mode": "Testing, linting, cleanup",
  chat: "Questions and answers only",
}

const modeOrder = Object.keys(modeDescriptions)

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
