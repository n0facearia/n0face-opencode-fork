import { DialogSelect } from "../ui/dialog-select"
import { useDialog } from "../ui/dialog"
import { useKV } from "../context/kv"
import { useToast } from "../ui/toast"
import { builtinMascot } from "@/cli/logo"
import { DialogPrompt } from "../ui/dialog-prompt"
import type { MascotMode } from "./mascot"
import type { LogoShape } from "./logo"

const legacyCatIdle: LogoShape = {
  left: ["▀▄▄▄▄▄▄▄▀", "█ ~ _ ~ █", "█▄▄▄▄▄▄▄█", "▄███████▄"],
  right: ["", "", "", ""],
}

const legacyCatThink: LogoShape = {
  left: ["▀▄▄▄▄▄▄▄▀", "█ ^ _ ^ █", "█▄▄▄▄▄▄▄█", "▄███████▄"],
  right: ["", "", "", ""],
}

const legacyCatPlan: LogoShape = {
  left: ["▀▄▄▄▄▄▄▄▀", "█  ███  █", "█▄▄▄▄▄▄▄█", "▄███████▄"],
  right: ["", "", "", ""],
}

const oldMascotIdle: LogoShape = {
  left: ["┌─────────────┐ ", "│             │ ", "│ █     █     │ ", "│              │ ", "│  ────────    │ ", "└─────────────┘ ", ""],
  right: ["", "", "", "", "", "", ""],
}

type MascotPreset = {
  name: string
  shapes: Record<MascotMode, LogoShape>
}

const legacyShapes: Record<MascotMode, LogoShape> = {
  idle: legacyCatIdle,
  thinking: legacyCatThink,
  planning: legacyCatPlan,
}

function shapesEqual(a: Record<MascotMode, LogoShape>, b: Record<MascotMode, LogoShape>) {
  return JSON.stringify(a) === JSON.stringify(b)
}

const oldMascotShapes: Record<MascotMode, LogoShape> = {
  idle: oldMascotIdle,
  thinking: oldMascotIdle,
  planning: oldMascotIdle,
}

function currentPresetName(kv: ReturnType<typeof useKV>): string | undefined {
  const data = kv.get("mascot_data") as Record<MascotMode, LogoShape> | undefined
  if (!data) return "AM"
  if (shapesEqual(data, builtinMascot.shapes)) return "AM"
  if (shapesEqual(data, oldMascotShapes)) return "Old Mascot"
  if (shapesEqual(data, legacyShapes)) return "cat"
  const presets = kv.get("mascot_presets") as MascotPreset[] | undefined
  if (presets) {
    for (const p of presets) {
      if (shapesEqual(data, p.shapes)) return p.name
    }
  }
  return undefined
}

export function DialogMascot() {
  const dialog = useDialog()
  const kv = useKV()
  const toast = useToast()
  const presets = (kv.get("mascot_presets") as MascotPreset[] | undefined) ?? []

  const options = [
    {
      title: "AM",
      value: "builtin",
      onSelect() {
        kv.set("mascot_data", builtinMascot.shapes)
        dialog.clear()
      },
    },
    {
      title: "cat",
      value: "legacy",
      onSelect() {
        kv.set("mascot_data", legacyShapes)
        dialog.clear()
      },
    },
    {
      title: "Old Mascot",
      value: "old-mascot",
      onSelect() {
        kv.set("mascot_data", oldMascotShapes)
        dialog.clear()
      },
    },
    ...presets.map((p) => ({
      title: p.name,
      value: p.name,
      onSelect() {
        kv.set("mascot_data", p.shapes)
        dialog.clear()
      },
    })),
    {
      title: "Custom...",
      value: "custom",
      async onSelect(ctx: any) {
        const name = await DialogPrompt.show(ctx, "Mascot name", {
          placeholder: "Enter a name for your custom mascot",
        })
        if (!name) return

        const rawArt = await DialogPrompt.show(ctx, "Paste ASCII art (each line ~19 chars)", {
          placeholder: "Paste your ASCII art here",
        })
        if (!rawArt) return

        const lines = rawArt.trim().split("\n").filter((l) => l.length > 0)
        if (lines.length === 0) {
          toast.show({ message: "No art lines pasted", variant: "error" })
          return
        }

        const left = lines.map((l) => l.padEnd(19, " ").slice(0, 19))
        const right = lines.map(() => "")
        const shape: LogoShape = { left, right }
        const shapes: Record<MascotMode, LogoShape> = { idle: shape, thinking: shape, planning: shape }

        const updated = [...presets, { name, shapes }]
        kv.set("mascot_presets", updated)
        kv.set("mascot_data", shapes)
        ctx.clear()
        toast.show({ message: `Mascot "${name}" saved and applied`, variant: "success" })
      },
    },
  ]

  return <DialogSelect title="Mascots" options={options} current={currentPresetName(kv)} />
}
