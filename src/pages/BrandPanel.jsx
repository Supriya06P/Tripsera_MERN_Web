import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import {
  X,
  ChevronDown,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Square,
  Circle,
  Type,
  Layers,
  UploadCloud
} from "lucide-react";

// --- Sub-components (Updated to Blue Theme) ---

function Section({ title, children, defaultOpen = true, icon: Icon }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-3 group">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</h3>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}

function AdjustmentSlider({ label, value, min = 0, max = 200, step = 1, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-[11px] font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-600 border border-blue-100">
          {value}{label === "Opacity" ? "%" : ""}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="cursor-pointer accent-blue-600"
      />
    </div>
  );
}

// --- Main Component ---

export default function BrandPanel({ selectedImage, updateImage, onClose }) {
  const initialState = {
    shape: "square",
    borderSize: 0,
    borderColor: "#2563eb", // Blue-600
    opacity: 100,
    rotation: 0,
    flipX: false,
    flipY: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    shadow: 0,
    filterPreset: "none"
  };

  const [state, setState] = useState(initialState);
  const lastImageId = useRef(null);

  useEffect(() => {
    if (selectedImage && selectedImage.id !== lastImageId.current) {
      setState((prev) => ({ ...prev, ...selectedImage }));
      lastImageId.current = selectedImage.id;
    }
  }, [selectedImage]);

  useEffect(() => {
    if (!selectedImage) return;

    const updates = {
      shape: state.shape,
      borderSize: state.borderSize,
      borderColor: state.borderColor,
      opacity: state.opacity,
      rotation: state.rotation,
      flipX: state.flipX,
      flipY: state.flipY,
      brightness: state.brightness,
      contrast: state.contrast,
      saturation: state.saturation,
      blur: state.blur,
      shadow: state.shadow,
      filterPreset: state.filterPreset,
      src: state.src
    };

    updateImage(updates);
  }, [state]);

  const update = (key, value) => setState((prev) => ({ ...prev, [key]: value }));

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("src", reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setState({
      ...initialState,
      id: selectedImage.id,
      src: selectedImage.src,
      x: selectedImage.x,
      y: selectedImage.y,
      width: selectedImage.width,
      height: selectedImage.height
    });
  };

  const filters = [
    { name: "None", value: "none", class: "bg-gray-200" },
    { name: "Mono", value: "grayscale(1)", class: "grayscale bg-gray-400" },
    { name: "Retro", value: "sepia(0.8)", class: "sepia bg-orange-200" },
    { name: "Vivid", value: "contrast(1.2) saturate(1.5)", class: "saturate-200 bg-blue-200" },
  ];

  if (!selectedImage) return null;

  return (
    <div className="w-80 bg-white border-l h-full flex flex-col shadow-sm font-sans animate-in fade-in slide-in-from-right-4">

      {/* Header */}
      <header className="px-5 py-5 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            Edit Image
          </h2>
          <p className="text-xs text-gray-500 mt-1">Refine your brand assets</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
          <X size={20} />
        </button>
      </header>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 custom-scrollbar">

        {/* Swap Image Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="group mb-6 p-4 border-2 border-dashed border-blue-100 rounded-xl text-center bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <UploadCloud className="mx-auto text-blue-400 group-hover:text-blue-600 mb-2 transition-colors" size={24} />
          <p className="text-[12px] font-bold text-gray-700">Swap current image</p>
          <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-tighter">Drop or click browse</p>

          <label className="cursor-pointer inline-block">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100">
              Browse Files
            </span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
          </label>
        </div>

        {/* Appearance Section */}
        <Section title="Appearance" icon={Layers}>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {["square", "rounded", "circle"].map((s) => (
              <button
                key={s}
                onClick={() => update("shape", s)}
                className={`flex-1 py-2 flex justify-center items-center rounded-lg transition-all duration-200
                ${state.shape === s ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                {s === "square" && <Square size={16} />}
                {s === "rounded" && <Square size={16} className="rounded-sm" />}
                {s === "circle" && <Circle size={16} />}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border border-gray-100 p-2 rounded-xl bg-white shadow-sm">
            <span className="text-xs text-gray-500 font-medium ml-1">Border Color</span>
            <div className="relative group">
              <div
                className="w-14 h-7 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-transform group-hover:scale-105"
                style={{ backgroundColor: state.borderColor }}
              />
              <input
                type="color"
                value={state.borderColor}
                onChange={(e) => update("borderColor", e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
          <AdjustmentSlider label="Border Weight" value={state.borderSize} max={20} onChange={(v) => update("borderSize", v)} />
        </Section>

        {/* Adjustments Section */}
        <Section title="Adjustments" icon={Type}>
          <div className="space-y-6">
            <AdjustmentSlider label="Brightness" value={state.brightness} onChange={(v) => update("brightness", v)} />
            <AdjustmentSlider label="Contrast" value={state.contrast} onChange={(v) => update("contrast", v)} />
            <AdjustmentSlider label="Opacity" value={state.opacity} min={0} max={100} onChange={(v) => update("opacity", v)} />
          </div>
        </Section>

        {/* Presets Section */}
        <Section title="Presets">
          <div className="grid grid-cols-2 gap-3">
            {filters.map((f) => (
              <button
                key={f.name}
                onClick={() => update("filterPreset", f.value)}
                className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all
                ${state.filterPreset === f.value ? "border-blue-500 ring-2 ring-blue-50/50" : "border-transparent hover:border-gray-200"}`}
              >
                <div className={`absolute inset-0 opacity-30 ${f.class}`} />
                <span className={`relative text-xs font-bold ${state.filterPreset === f.value ? "text-blue-700" : "text-gray-600"}`}>
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Transform Section */}
        <Section title="Transform" icon={RotateCw}>
          <AdjustmentSlider label="Rotation" value={state.rotation} max={360} onChange={(v) => update("rotation", v)} />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => update("flipX", !state.flipX)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold
              ${state.flipX ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"}`}
            >
              <FlipHorizontal size={14} /> Flip X
            </button>
            <button
              onClick={() => update("flipY", !state.flipY)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold
              ${state.flipY ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"}`}
            >
              <FlipVertical size={14} /> Flip Y
            </button>
          </div>
        </Section>
      </div>

      {/* Footer Action */}
      <div className="p-5 border-t border-gray-100">
        <button
          onClick={handleReset}
          className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-gray-200">
          Reset All Changes
        </button>
      </div>
    </div>
  );
}