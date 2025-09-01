import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import Layout from "../layout/Layout";

const TemplateDesigner = () => {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTool, setActiveTool] = useState("select");
  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState("#000000");
  const [qrSize, setQrSize] = useState(100);
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    // Initialize fabric canvas
    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: "#f8f9fa",
    });

    // Add default placeholders
    addDefaultPlaceholders();

    // Cleanup on unmount
    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
    };
  }, []);

 useEffect(() => {
  if (backgroundImage && fabricCanvas.current) {
    fabric.Image.fromURL(backgroundImage, (img) => {
      const canvasWidth = fabricCanvas.current.width;
      const canvasHeight = fabricCanvas.current.height;

      // Scale image proportionally to fit inside canvas
      img.scaleToWidth(canvasWidth);
      if (img.height * img.scaleX > canvasHeight) {
        img.scaleToHeight(canvasHeight);
      }

      fabricCanvas.current.setBackgroundImage(
        img,
        fabricCanvas.current.renderAll.bind(fabricCanvas.current), {
          originX: 'center',
          originY: 'center',
          left: canvasWidth / 2,
          top: canvasHeight / 2
        }
      );
    });
  }
}, [backgroundImage]);


  const addDefaultPlaceholders = () => {
    // Clear existing objects except background
    const objects = fabricCanvas.current.getObjects();
    objects.forEach(obj => {
      if (obj !== fabricCanvas.current.backgroundImage) {
        fabricCanvas.current.remove(obj);
      }
    });

    // Add placeholder for Name
    const nameText = new fabric.Text("Guest Name", {
      left: 150,
      top: 200,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: "Arial",
      selectable: true,
      hasControls: true,
      lockUniScaling: true,
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerColor: '#4286f4',
      cornerSize: 10
    });
    fabricCanvas.current.add(nameText);

    // Add placeholder for QR Code
    const qrPlaceholder = new fabric.Rect({
      left: 400,
      top: 250,
      width: qrSize,
      height: qrSize,
      fill: "rgba(0, 0, 0, 0.1)",
      stroke: "#4286f4",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      hasControls: true,
      lockUniScaling: true,
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerColor: '#4286f4',
      cornerSize: 10
    });
    
    const qrText = new fabric.Text("QR Code", {
      left: 400 + qrSize/2,
      top: 250 + qrSize/2,
      fontSize: 14,
      fill: "#4286f4",
      fontFamily: "Arial",
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasControls: false
    });
    
    fabricCanvas.current.add(qrPlaceholder);
    fabricCanvas.current.add(qrText);
    
    // Group the QR placeholder and text
    const qrGroup = new fabric.Group([qrPlaceholder, qrText], {
      selectable: true,
      hasControls: true,
      lockUniScaling: true
    });
    
    fabricCanvas.current.remove(qrPlaceholder);
    fabricCanvas.current.remove(qrText);
    fabricCanvas.current.add(qrGroup);

    fabricCanvas.current.renderAll();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const objects = fabricCanvas.current.getObjects().map((obj) => {
      if (obj.type === "text" && obj.text !== "QR Code") {
        return {
          type: "name",
          x: obj.left,
          y: obj.top,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          color: obj.fill,
          width: obj.width * obj.scaleX,
          height: obj.height * obj.scaleY,
        };
      } else if (obj.type === "group") {
        // This is our QR code group
        return {
          type: "qrcode",
          x: obj.left,
          y: obj.top,
          width: obj.width * obj.scaleX,
          height: obj.height * obj.scaleY,
        };
      }
      return null;
    }).filter(obj => obj !== null);

    console.log("Template Config:", objects);
    alert("Positions saved! Check console for JSON config.");
  };

  const handleReset = () => {
  if (fabricCanvas.current && typeof fabricCanvas.current.setBackgroundImage === "function") {
    setBackgroundImage(null);
    fabricCanvas.current.setBackgroundImage(
      null,
      fabricCanvas.current.renderAll.bind(fabricCanvas.current)
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
    addDefaultPlaceholders();
  }
};


  const updateTextProperties = () => {
    const objects = fabricCanvas.current.getObjects();
    objects.forEach(obj => {
      if (obj.type === "text" && obj.text !== "QR Code") {
        obj.set({
          fontSize: parseInt(fontSize),
          fill: textColor
        });
      }
    });
    fabricCanvas.current.renderAll();
  };

  const updateQrSize = () => {
    const objects = fabricCanvas.current.getObjects();
    objects.forEach(obj => {
      if (obj.type === "group") {
        // This is our QR code group
        const scale = qrSize / obj.width;
        obj.scale(scale);
      }
    });
    fabricCanvas.current.renderAll();
  };

  return (
    <Layout>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Invitation Template Designer</h1>
          <p className="text-gray-600 mb-6">Upload your design and customize the placement of text and QR code</p>
          
          <div className="instruction-box p-4 bg-blue-50 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-1 text-blue-700">
              <li>Upload your card design using the "Upload Design" button</li>
              <li>Drag and position the "Guest Name" text where you want it</li>
              <li>Drag and position the QR code placeholder where you want it</li>
              <li>Customize text size and color using the controls</li>
              <li>Adjust QR code size if needed</li>
              <li>Click "Save Positions" when finished</li>
            </ol>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/4">
              <div className="control-panel p-4 bg-gray-50 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Design Controls</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Card Design</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {backgroundImage && (
                    <div className="mt-2 text-xs text-green-600">✓ Image successfully loaded</div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Properties</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="w-full h-2 bg-blue-100 rounded appearance-none cursor-pointer"
                      />
                      <div className="text-xs text-gray-600 mt-1">{fontSize}px</div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                    
                    <button
                      onClick={updateTextProperties}
                      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 text-sm"
                    >
                      Apply Text Properties
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Size</label>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={qrSize}
                        onChange={(e) => setQrSize(e.target.value)}
                        className="w-full h-2 bg-blue-100 rounded appearance-none cursor-pointer"
                      />
                      <div className="text-xs text-gray-600 mt-1">{qrSize}px</div>
                    </div>
                    
                    <button
                      onClick={updateQrSize}
                      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 text-sm"
                    >
                      Apply QR Size
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 text-sm"
                  >
                    Save Positions
                  </button>
                </div>
              </div>
            </div>
            
            <div className="lg:w-3/4">
              <div className="bg-white p-4 rounded-lg shadow-inner flex justify-center">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="border rounded-lg shadow-md"
                    width={600}
                    height={400}
                  />
                  {!backgroundImage && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Upload a design to see it here
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                Drag and position the elements on your card template. 
                The blue circles are handles for moving and resizing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default TemplateDesigner;