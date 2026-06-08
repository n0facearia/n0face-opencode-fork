import { useLocal } from "@tui/context/local"
import { DialogSelect } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { createMemo } from "solid-js"

const modeDescriptions: Record<string, string> = {
  manager: "Project intake and build planning",
  design: "Visual identity and design system",
  frontend: "UI implementation",
  backend: "API, services, middleware",
  database: "Schema, migrations, ORM",
  cleanup: "Dead code, lint, unused deps",
  security: "Vulnerability scanning",
  testing: "Unit, integration, component tests",
  devops: "CI/CD, Docker, deployment",
  documentation: "Final docs and README",
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
