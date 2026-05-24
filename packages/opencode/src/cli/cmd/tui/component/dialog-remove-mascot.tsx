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

function shapesEqual(a: Record<MascotMode, LogoShape>, b: Record<MascotMode, LogoShape>) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function currentPresetName(kv: ReturnType<typeof useKV>): string | undefined {
  const data = kv.get("mascot_data") as Record<MascotMode, LogoShape> | undefined
  if (!data) return "N0face"
  if (shapesEqual(data, builtinMascot.shapes)) return "N0face"
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

  if (presets.length === 0) {
    return (
      <DialogSelect
        title="Remove Mascot"
        options={[
          {
            title: "No custom mascots to remove",
            value: "none",
            onSelect() {
              dialog.clear()
            },
          },
        ]}
      />
    )
  }

  const options = presets.map((p) => ({
    title: p.name,
    value: p.name,
    onSelect() {
      const updated = presets.filter((x) => x.name !== p.name)
      kv.set("mascot_presets", updated)
      const activeName = currentPresetName(kv)
      if (activeName === p.name) {
        kv.set("mascot_data", builtinMascot.shapes)
      }
      toast.show({ message: `Mascot "${p.name}" removed`, variant: "success" })
      dialog.clear()
    },
  }))

  return <DialogSelect title="Remove Mascot" options={options} />
}
