import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import Navbar from "./Navbar";
import ZoomControls from "./ZoomControls";
import Sidebar from "./Sidebar";
import TextToolbar from "./TextToolbar";
import FontPanel from "./FontPanel";
const EditorLayout = () => {
  const { id } = useParams();
  const location = useLocation();
  const stageRef = useRef(null);

  const user = { name: "John Doe", email: "john@tripsera.com", role: "admin", agencyName: "Tripsera Agency" };

  const [activeTab, setActiveTab] = useState("templates");
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 650 });
  const [elements, setElements] = useState([]);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isFontPanelOpen, setIsFontPanelOpen] = useState(false);

  const updateCanvas = (data) => {
    const newSize = {
      width: Number(data.canvasSize?.width) || 500,
      height: Number(data.canvasSize?.height) || 650
    };
    setCanvasSize(newSize);

    const sanitizedElements = (data.elements || []).map(el => {
      // Ensure all numeric values are actually numbers
      return {
        ...el,
        x: Number(el.x) || 0,
        y: Number(el.y) || 0,
        width: !isNaN(el.width) ? Number(el.width) : el.width,
        height: !isNaN(el.height) ? Number(el.height) : el.height,
        style: {
          ...el.style,
          zIndex: el.style?.zIndex || 1,
          // Ensure fonts have units if they are just numbers in DB
          fontSize: typeof el.style?.fontSize === 'number' ? `${el.style.fontSize}px` : el.style?.fontSize
        }
      };
    });

    setElements(sanitizedElements);
    setSelectedId(null);
    setTimeout(() => calculateFitScale(newSize), 100);
  };
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        // Priority: If there's an ID, ALWAYS fetch fresh data from DB
        if (id) {
          const response = await fetch(`http://localhost:5000/api/flyers/${id}`);
          const data = await response.json();
          if (data) {
            updateCanvas(data);
            return; // Exit early if we found DB data
          }
        }

        // Fallback to location state (for new creations)
        if (location.state?.template) {
          updateCanvas(location.state.template);
        }
      } catch (err) {
        toast.error("Could not load template");
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [id]);


  const handleAddElement = (type, content = "", color = "#6366f1") => {
    let elementStyle = {
      backgroundColor: color,
      zIndex: elements.length + 1,
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      fontWeight: "800",
      fontSize: "14px",
      padding: content ? "10px 20px" : "0px", // Only pad if it's a badge
      textAlign: "center"
    };

    // Shape Logic
    switch (type) {
      case "circle":
        elementStyle.borderRadius = "50%";
        break;
      case "triangle":
        elementStyle.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
        break;
      case "hexagon":
        elementStyle.clipPath = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
        break;
      case "star":
        elementStyle.clipPath = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
        break;
      case "line":
        elementStyle.height = "4px";
        elementStyle.backgroundColor = "#6366f1";
        elementStyle.padding = "0px";
        break;
      default:
        // 'rectangle' or 'highlight' use the default base styles
        break;
    }

    const newElement = {
      id: `el-${Date.now()}`,
      type: "element",
      elementType: type,
      content: content, // Used for badges
      x: canvasSize.width / 2 - (content ? 75 : 50),
      y: canvasSize.height / 2 - (content ? 25 : 50),
      width: content ? "auto" : (type === "line" ? 200 : 100),
      height: content ? "auto" : (type === "line" ? 4 : 100),
      style: elementStyle
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
    toast.success(`${content || type} added`);
  };
  // Inside EditorLayout.jsx
  useEffect(() => {
    // If we are in an edit panel but nothing is selected anymore, 
    // close the panel and go back to the regular sidebar tabs
    if (!selectedId && activePanel !== null) {
      setActivePanel(null);
    }
  }, [selectedId, activePanel]);
  const handleAddVideo = (url) => {
    // Check if the URL ends in .gif or comes from a GIF host
    const isGif = url.toLowerCase().endsWith('.gif') || url.includes('gifer.com') || url.startsWith('data:image/gif');

    const newElement = {
      id: `${isGif ? 'gif' : 'video'}-${Date.now()}`,
      type: isGif ? "image" : "video", // Set type to "image" for GIFs
      src: url,
      x: canvasSize.width / 2 - 150,
      y: canvasSize.height / 2 - 100,
      width: 300,
      height: 200,
      style: {
        zIndex: elements.length + 1,
        borderRadius: "12px",
        objectFit: "cover",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      }
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
    toast.success(`${isGif ? 'GIF' : 'Video'} added to canvas`);
  };
  const handleAddImage = async (url) => {
    try {
      // 1. Fetch the image data manually
      const response = await fetch(url);
      const blob = await response.blob();

      // 2. Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;

        const newElement = {
          id: `img-${Date.now()}`,
          type: "image",
          src: base64data, // Save the actual string, not the URL
          x: canvasSize.width / 2 - 100,
          y: canvasSize.height / 2 - 100,
          width: 200,
          height: 200,
          style: { zIndex: elements.length + 1, borderRadius: "8px", objectFit: "cover" }
        };
        setElements((prev) => [...prev, newElement]);
        setSelectedId(newElement.id);
      };
    } catch (err) {
      toast.error("This image host blocks downloads. Try uploading the image instead.");
      console.error("CORS block detected:", err);
    }
  };

  const handleAddText = (type, content) => {
    const fontSizes = { heading: { size: 40, weight: "800" }, subheading: { size: 24, weight: "600" }, body: { size: 16, weight: "400" } };
    const config = fontSizes[type] || fontSizes.body;
    const newElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: content,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 25,
      width: 200,
      height: "auto",
      style: { fontSize: config.size, fontWeight: config.weight, color: "#000000", textAlign: "center", zIndex: elements.length + 1, fontFamily: "sans-serif" }
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  const handleSave = async () => {
    const canvasElement = document.getElementById("canvas-root");
    if (!canvasElement) return;
    try {
      toast.info("Generating preview...");
      const canvas = await html2canvas(canvasElement, { useCORS: true, scale: 0.2 });
      const thumbnail = canvas.toDataURL("image/jpeg", 0.6);
      const response = await fetch("http://localhost:5000/api/save-flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My New Flyer", thumbnail, elements, canvasSize }),
      });
      if (response.ok) toast.success("Saved successfully!");
    } catch (err) {
      toast.error("Save failed");
    }
  };

  const calculateFitScale = (size) => {
    if (stageRef.current) {
      const padding = 120;
      const stageW = stageRef.current.offsetWidth - padding;
      const stageH = stageRef.current.offsetHeight - padding;
      setScale(Math.min(stageW / size.width, stageH / size.height));
    }
  };

  const handleMouseDown = (e, id) => {
    setSelectedId(id);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedId) return;
    const rect = document.getElementById("canvas-root").getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId
          ? { ...el, x: mouseX - el.width / 2, y: mouseY - (typeof el.height === 'number' ? el.height / 2 : 20) }
          : el
      )
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-100 font-bold text-purple-600">Initializing...</div>;
  const handleDeleteElement = (elementId) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
    setSelectedId(null);
    toast.success("Element deleted");
  };
  const selectedElement = elements.find((el) => el.id === selectedId);
  // Inside EditorLayout.jsx

  const handleExport = async () => {
    const canvasElement = document.getElementById("canvas-root");
    if (!canvasElement) {
      toast.error("Canvas not found");
      return;
    }

    try {
      toast.info("Preparing your download...", { icon: "🚀" });

      const canvas = await html2canvas(canvasElement, {
        useCORS: true,
        scale: 2,
        // JPEG doesn't support transparency, so a background color is required
        backgroundColor: "#ffffff",
      });

      // 1. Change MIME type to "image/jpeg"
      // 2. The second argument (0.9) is the quality (0.0 to 1.0)
      const image = canvas.toDataURL("image/jpeg", 0.9);

      const link = document.createElement("a");
      // 3. Update the file extension in the filename
      link.download = `Tripsera-${id || "Flyer"}-${Date.now()}.jpg`;
      link.href = image;
      link.click();

      toast.success("Flyer downloaded successfully!");
    } catch (err) {
      console.error("Export Error:", err);
      toast.error("Failed to export image");
    }
  };


  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden select-none">
      <Navbar user={user} onSave={handleSave} onExport={handleExport} />

      {selectedId && selectedElement && (
        <div
          className="fixed top-[80px] left-80 right-0 z-[100] flex justify-center pointer-events-none"
          onMouseDown={(e) => e.stopPropagation()} // Stop canvas from seeing this
        >
          <div className="pointer-events-auto">
            <TextToolbar
              element={selectedElement}
              setElements={setElements}
              onDelete={handleDeleteElement}
              openFontPanel={() => setActivePanel("font")}
              openEffectsPanel={() => setActivePanel("effects")}
              openPositionPanel={() => setActivePanel("position")}
            />
          </div>
        </div>
      )}
      <div className="flex flex-1 pt-[65px] overflow-hidden bg-white" onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          onSelectTemplate={updateCanvas}
          onAddText={handleAddText}
          onAddImage={handleAddImage}
          onAddElement={handleAddElement} onAddVideo={handleAddVideo} selectedElement={selectedElement}
          setElements={setElements}
          selectedId={selectedId}
        />


        <div
          ref={stageRef}

          className="flex-1 overflow-auto flex items-center justify-center p-10 bg-slate-100/50 border-l border-slate-200 relative"
          onClick={() => {
            // Only deselect if we aren't clicking the toolbar or a panel
            if (activePanel === null) setSelectedId(null);
          }} >

          <ZoomControls scale={scale} setScale={setScale} onReset={() => calculateFitScale(canvasSize)} />

          <div style={{ width: canvasSize.width * scale, height: canvasSize.height * scale, position: "relative", transition: "all 0.3s ease" }}>
            {/* Stop propagation here so clicking the toolbar doesn't trigger the canvas onClick */}
            <div
              id="canvas-root"
              style={{
                width: canvasSize.width, height: canvasSize.height,
                transform: `scale(${scale})`, transformOrigin: "top left",
                backgroundColor: "#ffffff", position: "absolute", top: 0, left: 0,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)", overflow: "hidden"
              }}
              onClick={() => setSelectedId(null)}
            >
              {elements.map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, el.id);
                  }}
                  style={{
                    // Core Positioning
                    position: "absolute",
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: typeof el.width === "number" ? `${el.width}px` : el.width,
                    height: typeof el.height === "number" ? `${el.height}px` : el.height,

                    // Spread DB styles (Important for: transform, filter, fontFamily, etc.)
                    ...el.style,

                    // Editor Overrides
                    zIndex: el.style?.zIndex || 1,
                    cursor: isDragging && selectedId === el.id ? "grabbing" : "grab",
                    outline: selectedId === el.id ? "2px solid #6366f1" : "none",
                    display: "flex",
                    flexDirection: "column",
                    transition: isDragging ? "none" : "all 0.2s ease",
                    userSelect: "none",
                    // Badges/Rects with content need auto-width flexibility
                    minWidth: el.content && el.type !== "text" ? "max-content" : "unset",
                  }}
                >
                  {/* 1. IMAGES (Handles Backgrounds & Cards) */}
                  {el.type === "image" && (
                    <img
                      // Wrap the original src with your proxy URL
                      src={`http://localhost:5000/api/proxy?url=${encodeURIComponent(el.src)}`}
                      alt=""
                      crossOrigin="anonymous"
                      className="w-full h-full pointer-events-none object-cover rounded-[inherit]"
                      style={{ filter: el.style?.filter }}
                    />
                  )}

                  {/* 2. PURE TEXT (Handles Titles & Descriptions) */}
                  {el.type === "text" && (
                    <div
                      style={{
                        width: "100%",
                        whiteSpace: "pre-line",
                        outline: "none",
                        textAlign: el.style?.textAlign || "left",
                        fontSize: el.style?.fontSize,
                        fontWeight: el.style?.fontWeight,
                        fontFamily: el.style?.fontFamily,
                        color: el.style?.color || "#000",
                      }}
                      contentEditable={selectedId === el.id}
                      suppressContentEditableWarning={true}
                      // ADD THIS: Prevents clicking the text from deselecting itself
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => {
                        // Optional: Update the element content in state when you finish typing
                        const newContent = e.target.innerText;
                        setElements(prev => prev.map(item =>
                          item.id === el.id ? { ...item, content: newContent } : item
                        ));
                      }}
                    >
                      {el.content}
                    </div>
                  )}

                  {/* 3. SHAPES & RECTANGLES (Handles Overlays & Buttons) */}
                  {(el.type === "element" || el.type === "rect") && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: el.style?.backgroundColor || el.style?.background || "transparent",
                        borderRadius: el.style?.borderRadius || "0px",
                        clipPath: el.style?.clipPath,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        whiteSpace: "nowrap",
                        color: el.style?.color || "#ffffff",
                      }}
                    >
                      {el.content && (
                        <span style={{ fontSize: el.style?.fontSize, fontWeight: el.style?.fontWeight }}>
                          {el.content}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 4. VIDEOS & GIFs */}
                  {el.type === "video" && (
                    <video
                      src={el.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full pointer-events-none object-cover rounded-[inherit]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;