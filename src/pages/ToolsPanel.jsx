import { useState, useRef, useEffect } from "react";
import {
  MousePointer2, Pencil, Square, Minus,
  StickyNote, Type, Table, X, Palette,
  LayoutGrid, Plus, SlidersHorizontal,
  Circle, Triangle, Diamond, Pentagon, Hexagon
} from "lucide-react";

// --- Sticky Note Sub-Menu ---
const StickyNoteSubMenu = ({ onSelectColor }) => {
  const stickyColors = [
    { id: "yellow", hex: "#FFD600" },
    { id: "orange", hex: "#FFB347" },
    { id: "pink", hex: "#FF7EB9" },
    { id: "blue", hex: "#7AFCFF" },
    { id: "green", hex: "#4ADE80" },
    { id: "purple", hex: "#C084FC" },
  ];

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-3">
      {stickyColors.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelectColor(color.hex)}
          className="w-8 h-8 rounded-lg shadow-sm transition-transform hover:scale-110 active:scale-95 relative overflow-hidden"
          style={{ backgroundColor: color.hex }}
        >
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-black/10"
            style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
          />
        </button>
      ))}
    </div>
  );
};

// --- Shape Sub-Menu ---
const ShapeSubMenu = ({ onSelectShape, activeShape }) => {
  const shapes = [
    { id: "square", icon: <rect x="4" y="4" width="16" height="16" fill="currentColor" /> },
    { id: "rounded-square", icon: <rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" /> },
    { id: "circle", icon: <circle cx="12" cy="12" r="8" fill="currentColor" /> },
    { id: "triangle", icon: <polygon points="12,4 20,20 4,20" fill="currentColor" /> },
    { id: "triangle-upside-down", icon: <polygon points="4,4 20,4 12,20" fill="currentColor" /> },
    { id: "diamond", icon: <polygon points="12,2 22,12 12,22 2,12" fill="currentColor" /> },
    { id: "pentagon", icon: <polygon points="12,2 22,9 18,22 6,22 2,9" fill="currentColor" /> },
    { id: "hexagon", icon: <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="currentColor" /> },
    { id: "minus", icon: <rect x="4" y="10" width="16" height="4" fill="currentColor" /> },
  ];

  return (
    <div className="flex flex-col items-center gap-2 py-4 px-2 max-h-[340px] overflow-y-auto overflow-x-hidden custom-scrollbar">
      {shapes.map((shape) => (
        <button
          key={shape.id}
          onClick={() => onSelectShape(shape.id)}
          className={`w-12 h-12 flex-shrink-0 flex items-center justify-center transition-all rounded-xl
            ${activeShape === shape.id ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100" : "text-gray-400 hover:bg-gray-50 hover:text-blue-500"}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">{shape.icon}</svg>
        </button>
      ))}
    </div>
  );
};

// --- Settings Panel ---
const SettingsPanel = ({ weight, onWeightChange, transparency, onTransparencyChange }) => {
  return (
    <div className="w-[280px] bg-white rounded-[24px] shadow-2xl border border-gray-100 p-6 animate-in slide-in-from-bottom-2 duration-200">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-bold text-sm">Weight</span>
            <div className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              {weight}
            </div>
          </div>
          <input
            type="range" min="1" max="100" value={weight}
            onChange={(e) => onWeightChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-bold text-sm">Transparency</span>
            <div className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              {transparency}
            </div>
          </div>
          <input
            type="range" min="1" max="100" value={transparency}
            onChange={(e) => onTransparencyChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

// --- Color Panel ---
const ColorPanel = ({ activeColor, onColorChange }) => {
  const highlighterColors = ["#FFD3A2", "#FFFF00", "#ADFF2F", "#00FFFF", "#FF99FF", "#B399FF"];
  const documentColors = ["#001F3F", "#003366", "#083344", "#1C1C1C", "#262626", "#FFFFFF", "#FFFF00", "#FF4444"];
  return (
    <div className="w-[320px] bg-white rounded-[32px] shadow-2xl border border-gray-100 p-6 animate-in zoom-in-95 duration-200">
      <div className="mb-6 text-left">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold"><Palette size={18} className="text-blue-500" /> <span>Highlighter colors</span></div>
        <div className="grid grid-cols-6 gap-3">
          {highlighterColors.map((c) => (
            <button key={c} onClick={() => onColorChange(c)} className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${activeColor === c ? 'border-blue-500 ring-2 ring-blue-100' : 'border-white shadow-sm'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold"><LayoutGrid size={18} className="text-blue-500" /> <span>Document colors</span></div>
        <div className="grid grid-cols-6 gap-3">
          <button className="w-9 h-9 rounded-full border border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400 transition-colors">
            <Plus size={16} className="text-gray-400" />
          </button>
          {documentColors.map((c, i) => (
            <button key={i} onClick={() => onColorChange(c)} className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${activeColor === c ? 'border-blue-500 ring-2 ring-blue-100' : 'border-white shadow-sm'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Pencil Graphic ---
const PencilGraphic = ({ id, color, opacity }) => {
  const tips = { pen: "M0 4L12 8L0 12V4Z", marker: "M0 2L12 5V11L0 14V2Z", highlighter: "M0 0H10V16H0V0Z", eraser: "M0 0H8C12 0 12 16 8 16H0V0Z" };
  return (
    <div className="flex items-center" style={{ opacity: opacity / 100 }}>
      <div className="h-4 w-10 bg-white border-y border-l border-gray-100 rounded-l-sm" />
      <div className="h-4 w-2 border-y border-gray-100" style={{ backgroundColor: color }} />
      <svg width="12" height="16" viewBox="0 0 12 16" className="overflow-visible"><path d={tips[id] || tips.pen} fill={color} /></svg>
    </div>
  );
};

// --- Drawing Sub-Menu ---
const DrawSubMenu = ({ activeBrush, onSelect, activeColor, onColorChange, strokeWidth, onStrokeChange, transparency, onTransparencyChange }) => {
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowColorPanel(false);
        setShowSettings(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const brushes = [{ id: "pen", baseColor: "#2563eb" }, { id: "marker", baseColor: "#dc2626" }, { id: "highlighter", baseColor: "#06b6d4" }, { id: "eraser", baseColor: "#f87171" }];

  return (
    <div ref={panelRef} className="flex flex-col items-center gap-6 py-6 px-3 relative">
      {brushes.map((brush) => (
        <button key={brush.id} onClick={() => onSelect(brush.id)} className={`group relative flex items-center transition-all ${activeBrush === brush.id ? "scale-125 translate-x-3" : "opacity-60 hover:opacity-100"}`}>
          <PencilGraphic id={brush.id} color={activeBrush === brush.id ? activeColor : brush.baseColor} opacity={activeBrush === brush.id ? transparency : 100} />
        </button>
      ))}
      <div className="w-10 h-[1px] bg-gray-100 my-1" />

      <div className="relative">
        <button
          onClick={() => { setShowColorPanel(!showColorPanel); setShowSettings(false); }}
          className="w-10 h-10 rounded-full border-4 border-white shadow-lg transition-transform hover:scale-110"
          style={{ backgroundColor: activeColor }}
        />
        {showColorPanel && (
          <div className="absolute left-full ml-4 top-0 z-[120]">
            <ColorPanel activeColor={activeColor} onColorChange={(c) => { onColorChange(c); setShowColorPanel(false); }} />
          </div>
        )}
      </div>

      <button onClick={() => { setShowSettings(!showSettings); setShowColorPanel(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${showSettings ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-400"}`}>
        <div className="w-6 h-[2px] bg-current rounded-full" />
        <div className="w-6 h-[4px] bg-current rounded-full" />
        <div className="w-6 h-[6px] bg-current rounded-full" />
      </button>

      {showSettings && (
        <div className="absolute left-full ml-4 bottom-0 z-[110]">
          <SettingsPanel weight={strokeWidth} onWeightChange={onStrokeChange} transparency={transparency} onTransparencyChange={onTransparencyChange} />
        </div>
      )}
    </div>
  );
};

// --- Main ToolsPanel ---
export default function ToolsPanel({
  onClose, onAddShape, onAddSticky, onSelectBrush, brushColor,
  setBrushColor, brushWeight, setBrushWeight, brushOpacity,
  setBrushOpacity, onSelectTool, onAddText
}) {
  const [active, setActive] = useState(null);
  const [activeBrush, setActiveBrush] = useState("pen");
  const [selectedShape, setSelectedShape] = useState(null);

  const tools = [
    { id: "draw", label: "Draw", icon: <Pencil size={20} /> },
    { id: "shape", label: "Shapes", icon: <Square size={20} /> },
    { id: "sticky", label: "Sticky Note", icon: <StickyNote size={20} /> },
    { id: "text", label: "Text", icon: <Type size={20} /> },
  ];

  return (
    <div className="absolute left-28 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
      <button onClick={onClose} className="mb-4 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center border border-gray-100 hover:text-red-500 transition-colors">
        <X size={18} />
      </button>

      <div className="relative flex items-start gap-4">
        {/* Main Sidebar */}
        <div className="w-16 bg-white rounded-[32px] shadow-2xl border border-gray-100 py-6 flex flex-col items-center gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                const newTool = active === tool.id ? null : tool.id;
                setActive(newTool);
                onSelectTool?.(newTool);
                if (tool.id === "text") onAddText?.();
              }}
              className={`group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
                ${active === tool.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110"
                  : "text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:scale-105"}`}
            >
              {active === tool.id && (
                <div className="absolute inset-0 rounded-2xl bg-blue-500 blur-xl opacity-30 -z-10" />
              )}
              <div className="transition-transform duration-300 group-hover:rotate-6">
                {tool.icon}
              </div>

              {/* Tooltip */}
              <div className="absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl uppercase tracking-wider">
                  {tool.label}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic Sub-Menus */}
        <div className="animate-in fade-in slide-in-from-left-4 duration-200">
          {active === "draw" && (
            <div className="bg-white shadow-2xl border border-gray-100 rounded-[40px] w-24">
              <DrawSubMenu
                activeBrush={activeBrush}
                activeColor={brushColor}
                strokeWidth={brushWeight}
                onStrokeChange={setBrushWeight}
                transparency={brushOpacity}
                onTransparencyChange={setBrushOpacity}
                onSelect={(id) => {
                  setActiveBrush(id);
                  onSelectBrush?.(id);
                }}
                onColorChange={setBrushColor}
              />
            </div>
          )}

          {active === "shape" && (
            <div className="bg-white shadow-2xl border border-gray-100 rounded-[28px] w-16 overflow-hidden">
              <ShapeSubMenu
                activeShape={selectedShape}
                onSelectShape={(id) => {
                  setSelectedShape(id);
                  onAddShape?.(id);
                }}
              />
            </div>
          )}

          {active === "sticky" && (
            <div className="bg-white shadow-2xl border border-gray-100 rounded-[28px] w-14 overflow-hidden">
              <StickyNoteSubMenu onSelectColor={(color) => onAddSticky?.(color)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}