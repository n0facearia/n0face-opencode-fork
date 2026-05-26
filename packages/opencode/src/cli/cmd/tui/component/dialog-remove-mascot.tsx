import { DialogSelect } from "../ui/dialog-select"
import { useDialog } from "../ui/dialog"
import { useKV } from "../context/kv"
import { useToast } from "../ui/toast"
import { builtinMascot } from "@/cli/logo"
import type { MascotMode } from "./mascot"
import type { LogoShape } from "./logo"

type MascotPreset = {
  name: string
  shapes: Record<MascotMode, LogoShape>
}

const legacyCatShapes: Record<MascotMode, LogoShape> = {
  idle: { left: ["▀▄▄▄▄▄▄▄▀", "█ ~ _ ~ █", "█▄▄▄▄▄▄▄█", "▄███████▄"], right: ["", "", "", ""] },
  thinking: { left: ["▀▄▄▄▄▄▄▄▀", "█ ^ _ ^ █", "█▄▄▄▄▄▄▄█", "▄███████▄"], right: ["", "", "", ""] },
  planning: { left: ["▀▄▄▄▄▄▄▄▀", "█  ███  █", "█▄▄▄▄▄▄▄█", "▄███████▄"], right: ["", "", "", ""] },
}

const oldMascotShapes: Record<MascotMode, LogoShape> = {
  idle: { left: ["┌─────────────┐ ", "│             │ ", "│ █     █     │ ", "│              │ ", "│  ────────    │ ", "└─────────────┘ ", ""], right: ["", "", "", "", "", "", ""] },
  thinking: { left: ["┌─────────────┐ ", "│             │ ", "│ █     █     │ ", "│              │ ", "│  ────────    │ ", "└─────────────┘ ", ""], right: ["", "", "", "", "", "", ""] },
  planning: { left: ["┌─────────────┐ ", "│             │ ", "│ █     █     │ ", "│              │ ", "│  ────────    │ ", "└─────────────┘ ", ""], right: ["", "", "", "", "", "", ""] },
}

const builtinNames = ["N0face", "cat", "Old Mascot"] as const

function shapesEqual(a: Record<MascotMode, LogoShape>, b: Record<MascotMode, LogoShape>) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function currentPresetName(kv: ReturnType<typeof useKV>): string | undefined {
  const data = kv.get("mascot_data") as Record<MascotMode, LogoShape> | undefined
  if (!data) return "N0face"
  if (shapesEqual(data, builtinMascot.shapes)) return "N0face"
  if (shapesEqual(data, oldMascotShapes)) return "Old Mascot"
  if (shapesEqual(data, legacyCatShapes)) return "cat"
  const presets = kv.get("mascot_presets") as MascotPreset[] | undefined
  if (presets) {
    for (const p of presets) {
      if (shapesEqual(data, p.shapes)) return p.name
    }
  }
  return undefined
}

export function DialogRemoveMascot() {
  const dialog = useDialog()
  const kv = useKV()
  const toast = useToast()
  const presets = (kv.get("mascot_presets") as MascotPreset[] | undefined) ?? []
  const current = currentPresetName(kv)

  const options = [
    {
      title: "N0face",
      value: "am",
      description: "(default)",
      disabled: true,
      onSelect() {},
    },
    {
      title: "cat",
      value: "cat",
      description: "(default)",
      disabled: true,
      onSelect() {},
    },
    {
      title: "Old Mascot",
      value: "old-mascot",
      description: "(default)",
      disabled: true,
      onSelect() {},
    },
    ...presets.map((p) => ({
      title: p.name,
      value: p.name,
      onSelect() {
        const updated = presets.filter((x) => x.name !== p.name)
        kv.set("mascot_presets", updated)
        if (current === p.name) {
          kv.set("mascot_data", builtinMascot.shapes)
        }
        toast.show({ message: `Mascot "${p.name}" removed`, variant: "success" })
        dialog.clear()
      },
    })),
  ]

  if (presets.length === 0) {
    return (
      <DialogSelect
        title="Remove Mascot"
        options={[
          {
            title: "No custom mascots to remove",
            value: "none",
            description: "N0face, cat, and Old Mascot are built-in defaults",
            onSelect() {
              dialog.clear()
            },
          },
        ]}
      />
    )
  }

  return <DialogSelect title="Remove Mascot" options={options} current={current} />
}
