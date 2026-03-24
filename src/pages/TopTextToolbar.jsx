import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  Strikethrough,
  AlignRight,
  Trash2,
  List,
  ListOrdered,
  ArrowUpDown,
  ArrowLeftRight,
  Type,
  PaintBucket, // Added for Background Icon
} from "lucide-react";

export default function TopTextToolbar({
  selectedText,
  setTexts,
  selectedTextId,
  setSelectedTextId,
  openFontPanel,
  openAnimationPanel,
  openEffectsPanel,
  openPositionPanel,
}) {
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);
  const [showBgMenu, setShowBgMenu] = useState(false); // New state for Background Dropdown
  const menuRef = useRef(null);
  const bgMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowSpacingMenu(false);
      }
      if (bgMenuRef.current && !bgMenuRef.current.contains(e.target)) {
        setShowBgMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedText) return null;

  const updateText = (updates) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === selectedTextId ? { ...t, ...updates } : t))
    );
  };

  const iconBtn = (active) =>
    `h-8 w-8 flex items-center justify-center rounded-md transition 
      hover:bg-gray-200 ${active ? "bg-gray-200" : ""}`;

  const textBtn =
    "h-8 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition";

  return (
    <div className="flex items-center gap-2">
      {/* FONT FAMILY */}
      <button
        onClick={openFontPanel}
        className="h-9 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition"
      >
        <span className="truncate max-w-30">{selectedText.fontFamily}</span>
        <span className="text-xs opacity-60">▾</span>
      </button>

      {/* FONT SIZE */}
      <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden h-9">
        <button
          className="px-3 hover:bg-gray-100"
          onClick={() => updateText({ fontSize: selectedText.fontSize - 2 })}
        >
          −
        </button>
        <input
          type="number"
          value={selectedText.fontSize}
          onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
          className="w-12 text-center text-sm outline-none"
        />
        <button
          className="px-3 hover:bg-gray-100"
          onClick={() => updateText({ fontSize: selectedText.fontSize + 2 })}
        >
          +
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* STYLE GROUP */}
      <div className="flex items-center bg-gray-50 rounded-lg p-1 gap-1">
        <button
          className={iconBtn(selectedText.fontWeight === "bold")}
          onClick={() =>
            updateText({
              fontWeight: selectedText.fontWeight === "bold" ? "normal" : "bold",
            })
          }
        >
          <Bold size={15} />
        </button>
        <button
          className={iconBtn(selectedText.fontStyle === "italic")}
          onClick={() =>
            updateText({
              fontStyle:
                selectedText.fontStyle === "italic" ? "normal" : "italic",
            })
          }
        >
          <Italic size={15} />
        </button>
        <button
          className={iconBtn(selectedText.textDecoration?.includes("underline"))}
          onClick={() => {
            const current = selectedText.textDecoration || "none";
            let next = current.includes("underline")
              ? current.replace("underline", "").trim() || "none"
              : current === "none"
              ? "underline"
              : `${current} underline`;
            updateText({ textDecoration: next });
          }}
        >
          <Underline size={15} />
        </button>
        <button
          className={iconBtn(
            selectedText.textDecoration?.includes("line-through")
          )}
          onClick={() => {
            const current = selectedText.textDecoration || "none";
            let next;
            if (current.includes("line-through")) {
              next = current.replace("line-through", "").trim() || "none";
            } else {
              next =
                current === "none" ? "line-through" : `${current} line-through`;
            }
            updateText({ textDecoration: next });
          }}
        >
          <Strikethrough size={15} />
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* ALIGNMENT (Cycle) */}
     <div className="flex items-center bg-gray-50 rounded-lg p-1">
  <button
    // Changed 'true' to a check against the current alignment
    className={iconBtn(selectedText.align && selectedText.align !== 'left')} 
    onClick={() => {
      const aligns = ["left", "center", "right"];
      const current = selectedText?.align || "left";
      const next = aligns[(aligns.indexOf(current) + 1) % aligns.length];
      updateText({ align: next });
    }}
  >
    {selectedText.align === "center" ? (
      <AlignCenter size={15} />
    ) : selectedText.align === "right" ? (
      <AlignRight size={15} />
    ) : (
      <AlignLeft size={15} />
    )}
  </button>
</div>

      {/* CASE TOGGLE */}
      <div className="flex items-center bg-gray-50 rounded-lg p-1">
        <button
          className={iconBtn(
            selectedText.textTransform === "uppercase" ||
              selectedText.textTransform === "lowercase"
          )}
          onClick={() => {
            const next =
              selectedText.textTransform === "uppercase"
                ? "lowercase"
                : "uppercase";
            updateText({ textTransform: next });
          }}
          title="Uppercase / Lowercase"
        >
          <span className="text-xs font-semibold">Aa</span>
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* TEXT COLOR PICKER */}
      <input
        type="color"
        value={selectedText.color || "#000000"}
        onChange={(e) => updateText({ color: e.target.value })}
        className="w-9 h-9 border border-gray-200 rounded-lg cursor-pointer"
        title="Text Color"
      />

      {/* ✅ NEW: BACKGROUND COLOR PICKER WITH DROPDOWN */}
      <div className="relative" ref={bgMenuRef}>
        <button
          onClick={() => setShowBgMenu(!showBgMenu)}
          className={`${iconBtn(showBgMenu)} w-9 h-9 border border-gray-200 rounded-lg bg-white`}
          title="Background Style"
        >
          <PaintBucket size={16} style={{ color: selectedText.backgroundColor || '#000' }} />
        </button>

        {showBgMenu && (
          <div className="absolute top-11 left-0 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-110 w-56 flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-2 block">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedText.backgroundColor || "#ffffff"}
                  onChange={(e) => updateText({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-none"
                />
                <button 
                  onClick={() => updateText({ backgroundColor: "transparent" })}
                  className="text-[10px] text-red-500 font-medium hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* ROUNDED CORNERS */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Rounded</label>
                <span className="text-[10px] font-mono">{selectedText.borderRadius || 0}px</span>
              </div>
              <input
                type="range"
                min="0" max="50"
                value={selectedText.borderRadius || 0}
                onChange={(e) => updateText({ borderRadius: parseInt(e.target.value) })}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>

            {/* OPACITY */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Opacity</label>
                <span className="text-[10px] font-mono">{Math.round((selectedText.bgOpacity || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={selectedText.bgOpacity || 1}
                onChange={(e) => updateText({ bgOpacity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* SPACING & LIST DROPDOWN */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowSpacingMenu(!showSpacingMenu)}
          className={`${iconBtn(showSpacingMenu)} gap-1 w-auto px-2 border border-transparent ${showSpacingMenu ? "border-gray-300 shadow-sm" : ""}`}
          title="Spacing & Lists"
        >
          <Type size={16} />
          <span className="text-xs opacity-60">▾</span>
        </button>

        {showSpacingMenu && (
          <div className="absolute top-10 left-0 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-110 w-64 flex flex-col gap-4">
            {/* ... Keep your existing Spacing Menu Content ... */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-2 block">List Style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateText({ listStyle: selectedText.listStyle === 'bullet' ? 'none' : 'bullet' })}
                  className={iconBtn(selectedText.listStyle === 'bullet')}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => updateText({ listStyle: selectedText.listStyle === 'number' ? 'none' : 'number' })}
                  className={iconBtn(selectedText.listStyle === 'number')}
                >
                  <ListOrdered size={16} />
                </button>
              </div>
            </div>
            <hr className="border-gray-100" />
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400">Letter Spacing</label>
              <input
                type="range" min="-2" max="15" step="0.5"
                value={selectedText.letterSpacing || 0}
                onChange={(e) => updateText({ letterSpacing: parseFloat(e.target.value) })}
                className="w-full h-1 bg-gray-200 rounded-lg accent-black"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400">Line Height</label>
              <input
                type="range" min="0.5" max="2.5" step="0.1"
                value={selectedText.lineHeight || 1.2}
                onChange={(e) => updateText({ lineHeight: parseFloat(e.target.value) })}
                className="w-full h-1 bg-gray-200 rounded-lg accent-black"
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-200 gap -2" />

      {/* ACTIONS */}
      <button onClick={() => openEffectsPanel()} className={textBtn}>Effects</button>
      <button onClick={openAnimationPanel} className={textBtn}>Animate</button>
      <button onClick={openPositionPanel} className={textBtn}>Position</button>

      <div className="h-6 w-px bg-gray-200" />

      {/* DELETE */}
      <button
        onClick={() => {
          setTexts((prev) => prev.filter((t) => t.id !== selectedTextId));
          if (typeof setSelectedTextId === "function") {
            setSelectedTextId(null);
          }
        }}
        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-50 text-red-500 transition"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}