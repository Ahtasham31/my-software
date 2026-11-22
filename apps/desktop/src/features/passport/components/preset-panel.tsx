import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form";
import { Badge } from "@/components/ui/display";
import type { PassportPreset, PresetCategory } from "@/types/passport";
import { categoriesOf } from "../engine/presets";
import { deletePreset, savePreset } from "@/services/passport";
import { useToast } from "@/components/ui/overlay";

interface Props {
  presets: PassportPreset[];
  selectedId: string;
  onSelect: (id: string) => void;
  onPresetsChange: () => void;
}

export function PresetPanel({ presets, selectedId, onSelect, onPresetsChange }: Props): JSX.Element {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("Custom");
  const [width, setWidth] = useState(35);
  const [height, setHeight] = useState(45);
  const [category, setCategory] = useState<PresetCategory>("custom");

  const groups = categoriesOf(presets);

  const handleAdd = async () => {
    try {
      await savePreset({
        name,
        category,
        widthMm: width,
        heightMm: height,
        dpi: 300
      });
      toast.show({ title: "Preset added", variant: "success" });
      setShowAdd(false);
      onPresetsChange();
    } catch (e) {
      toast.show({
        title: "Failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePreset(id);
      onPresetsChange();
    } catch (e) {
      toast.show({
        title: "Delete failed",
        description: (e as { message?: string }).message,
        variant: "error"
      });
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground">Presets</h3>
        <IconButton aria-label="Add preset" onClick={() => setShowAdd((v) => !v)} className="h-6 w-6">
          <Plus className="h-3.5 w-3.5" />
        </IconButton>
      </div>

      {showAdd && (
        <div className="space-y-2 border-b border-border p-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <div className="grid grid-cols-2 gap-1">
            <Input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 35)} placeholder="W mm" />
            <Input type="number" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 45)} placeholder="H mm" />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v as PresetCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="identity">Identity</SelectItem>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="id-card">ID Card</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => void handleAdd()} className="w-full">Save</Button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {Object.entries(groups).map(([cat, list]) => (
          <div key={cat} className="mb-3">
            <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
              {cat}
            </div>
            <ul className="space-y-0.5">
              {list.map((p) => (
                <li key={p.id} className="flex items-center gap-1">
                  <button
                    onClick={() => onSelect(p.id)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-left text-xs ${
                      selectedId === p.id ? "bg-active/15 text-foreground" : "hover:bg-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{p.name}</span>
                      {p.custom && <Badge variant="outline">Custom</Badge>}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {p.widthMm}×{p.heightMm} mm · {p.dpi} dpi
                    </div>
                  </button>
                  {p.custom && (
                    <IconButton
                      aria-label="Delete preset"
                      onClick={() => void handleDelete(p.id)}
                      className="h-5 w-5 text-error"
                    >
                      <Trash2 className="h-3 w-3" />
                    </IconButton>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-2 text-[10px] text-muted-foreground">
        <p>
          Requirements vary by country/document. Verify official specs before printing.
        </p>
      </div>
    </div>
  );
}