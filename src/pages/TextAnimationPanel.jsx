import { X, Play } from "lucide-react";

export default function TextAnimationPanel({
  selectedText,
  updateText,
  onClose,
}) {
  if (!selectedText) return null;

  const animations = [
    "None", "Block", "Bounce", "Fade", "Jello",
    "Pan", "Pop", "Rotate", "Scale", "Slide",
    "Tumble", "Wipe",
  ];

  const animClasses = {
    Block: "group-hover:anim-block",
    Bounce: "group-hover:anim-bounce",
    Fade: "group-hover:anim-fade",
    Jello: "group-hover:anim-jello",
    Pan: "group-hover:anim-pan",
    Pop: "group-hover:anim-pop",
    Rotate: "group-hover:anim-rotate",
    Scale: "group-hover:anim-scale",
    Slide: "group-hover:anim-slide",
    Tumble: "group-hover:anim-tumble",
    Wipe: "group-hover:anim-wipe",
  };

  return (
    <div className="w-80 bg-white border-r h-full flex flex-col shadow-xl animate-in slide-in-from-left-4 duration-300 z-50">

      {/* HEADER */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-blue-600 text-lg tracking-tight">
            Animations
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <h4 className="px-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
          Motion Presets
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {animations.map((anim) => (
            <button
              key={anim}
              onClick={() => updateText({ animation: anim })}
              className={`group relative rounded-2xl border p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300
                ${selectedText.animation === anim
                  ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-100 shadow-sm"
                  : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 hover:shadow-md"
                }`}
            >
              {/* Animation Preview Icon */}
              <span
                className={`text-2xl font-black transition-colors duration-300 inline-block ${selectedText.animation === anim ? "text-blue-600" : "text-gray-800"
                  } ${animClasses[anim] || ""}`}
              >
                Aa
              </span>

              {/* Label */}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${selectedText.animation === anim ? "text-blue-600" : "text-gray-500"
                }`}>
                {anim}
              </span>

              {/* Selection Dot */}
              {selectedText.animation === anim && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER HINT */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 font-medium">
          Hover over a preset to preview the motion
        </p>
      </div>
    </div>
  );
}