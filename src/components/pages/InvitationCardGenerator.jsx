import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Layout from "../layout/Layout";

const fonts = ["Arial", "Times New Roman", "Courier New", "Cursive"];

const CardDesigner = () => {
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [qrUrlTemplate, setQrUrlTemplate] = useState(
    "https://example.com/invite?name={NAME}"
  );

  const [placeholders, setPlaceholders] = useState([
    {
      id: "name",
      label: "Name",
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      fontSize: 24,
      fontFamily: "Arial",
      color: "red",
    },
    {
      id: "qr",
      label: "QR",
      x: 600,
      y: 400,
      width: 100,
      height: 100,
      color: "#000000",
    },
  ]);

  const [selectedId, setSelectedId] = useState(null);
  const [guestNames, setGuestNames] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const updatePlaceholder = (id, updates) => {
    setPlaceholders((prev) =>
      prev.map((ph) => (ph.id === id ? { ...ph, ...updates } : ph))
    );
  };

  // --- Image Upload ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImage(img.src);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  };

  // --- Excel Upload ---
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      setGuestNames(data.map((row) => `${row.FirstName} ${row.LastName}`));
      setPreviewIndex(0);
    };
    reader.readAsBinaryString(file);
  };

  // --- Generate QR as Blob for edit mode ---
  const awaitQRCodeBlob = async (text, color, size) => {
    const dataUrl = await QRCode.toDataURL(text, {
      color: { dark: color, light: "#ffffff" },
      width: size,
      margin: 0,
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // --- Preview Generator ---
  const generatePreview = async (guestName) => {
    if (!image) return null;

    const canvas = document.createElement("canvas");
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;
    const ctx = canvas.getContext("2d");

    const bgImage = new Image();
    bgImage.src = image;
    await new Promise((resolve) => (bgImage.onload = resolve));
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Scale factors in case placeholders were designed for 800x600
    const scaleX = imageSize.width / 800;
    const scaleY = imageSize.height / 600;

    for (const ph of placeholders) {
      if (ph.id === "name") {
        ctx.fillStyle = ph.color;
        ctx.font = `${ph.fontSize * scaleY}px ${ph.fontFamily}`;
        ctx.fillText(guestName, ph.x * scaleX, ph.y * scaleY + ph.fontSize * scaleY);
      }
      if (ph.id === "qr") {
        const qrDataUrl = await QRCode.toDataURL(
          qrUrlTemplate.replace("{NAME}", guestName),
          { color: { dark: ph.color, light: "#ffffff" }, width: ph.width * scaleX, margin: 0 }
        );
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => (qrImg.onload = resolve));
        ctx.drawImage(qrImg, ph.x * scaleX, ph.y * scaleY, ph.width * scaleX, ph.height * scaleY);
      }
    }

    return canvas.toDataURL("image/png");
  };

  // --- Refresh Preview manually ---
  const refreshPreview = async () => {
    if (guestNames.length > 0) {
      setLoadingPreview(true);
      const dataUrl = await generatePreview(guestNames[previewIndex]);
      setPreviewDataUrl(dataUrl);
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (guestNames.length > 0) {
      generatePreview(guestNames[previewIndex]).then(setPreviewDataUrl);
    }
  }, [guestNames, placeholders, previewIndex]);

  // --- Navigation ---
  const prevGuest = () => setPreviewIndex(Math.max(previewIndex - 1, 0));
  const nextGuest = () =>
    setPreviewIndex(Math.min(previewIndex + 1, guestNames.length - 1));

  // --- Download All ---
  const downloadAllInvitations = async () => {
    if (!guestNames.length || !image) return;
    const zip = new JSZip();

    for (const guest of guestNames) {
      const dataUrl = await generatePreview(guest);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      zip.file(`${guest}_invitation.png`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "invitations.zip");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-800">🎉 Invitation Card Designing</h1>

          <div className="bg-white p-4 rounded-xl shadow space-y-4">
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
              className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500"
            />
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500"
            />
          </div>

          {/* Customization Panel */}
          {selectedId && (
            <div className="bg-white p-4 rounded-xl shadow space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Edit {selectedId}</h2>
              {selectedId === "name" && (
                <>
                  <div>
                    <label className="block text-sm">Font Size</label>
                    <input
                      type="number"
                      value={placeholders.find((p) => p.id === selectedId).fontSize}
                      onChange={(e) =>
                        updatePlaceholder(selectedId, { fontSize: parseInt(e.target.value) })
                      }
                      className="border p-2 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Font Family</label>
                    <select
                      value={placeholders.find((p) => p.id === selectedId).fontFamily}
                      onChange={(e) =>
                        updatePlaceholder(selectedId, { fontFamily: e.target.value })
                      }
                      className="border p-2 rounded-lg w-full"
                    >
                      {fonts.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Text Color</label>
                    <input
                      type="color"
                      value={placeholders.find((p) => p.id === selectedId).color}
                      onChange={(e) =>
                        updatePlaceholder(selectedId, { color: e.target.value })
                      }
                      className="w-12 h-8 cursor-pointer"
                    />
                  </div>
                </>
              )}
              {selectedId === "qr" && (
                <div>
                  <label className="block text-sm">QR Color</label>
                  <input
                    type="color"
                    value={placeholders.find((p) => p.id === selectedId).color}
                    onChange={(e) => updatePlaceholder(selectedId, { color: e.target.value })}
                    className="w-12 h-8 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation & Download */}
          {guestNames.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3">
              <button
                onClick={prevGuest}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <button
                onClick={nextGuest}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Next
              </button>

              <button
                onClick={async () => {
                  if (!showPreview) await refreshPreview();
                  setShowPreview(!showPreview);
                }}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
              >
                {loadingPreview ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : showPreview ? (
                  "Back to Edit Mode"
                ) : (
                  " Preview Mode"
                )}
              </button>

              <button
                onClick={downloadAllInvitations}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                 Download All Invitations
              </button>
            </div>
          )}
        </div>

        {/* Designer Canvas */}
        <div className="flex-shrink-0">
          <div className="relative w-[90vw] md:w-[800px] h-[500px] md:h-[600px] bg-white border rounded-xl shadow-lg overflow-hidden">
            {/* --- EDIT MODE --- */}
            {!showPreview && image && (
              <>
                <img
                  src={image}
                  alt="Card"
                  className="w-full h-full object-cover absolute top-0 left-0"
                />

                {placeholders.map((ph) => (
                  <Rnd
                    key={ph.id}
                    size={{ width: ph.width, height: ph.height }}
                    position={{ x: ph.x, y: ph.y }}
                    bounds="parent"
                    onDragStop={(e, d) => updatePlaceholder(ph.id, { x: d.x, y: d.y })}
                    onResizeStop={(e, direction, ref, delta, position) =>
                      updatePlaceholder(ph.id, {
                        x: position.x,
                        y: position.y,
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                      })
                    }
                    onClick={() => setSelectedId(ph.id)}
                    className="flex items-center justify-center border-2 border-dashed rounded-lg cursor-move"
                    style={{
                      borderColor: ph.id === "name" ? "#ef4444" : "#9ca3af",
                      backgroundColor: ph.id === "qr" ? "rgba(0,0,0,0.15)" : "transparent",
                      color: ph.color,
                      fontSize: ph.fontSize,
                      fontFamily: ph.fontFamily,
                      fontWeight: "bold",
                    }}
                  >
                    {ph.label}
                  </Rnd>
                ))}
              </>
            )}

            {/* --- PREVIEW MODE --- */}
            {showPreview && previewDataUrl && (
              <img
                src={previewDataUrl}
                alt="Preview"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            )}

            {/* --- Loading Overlay --- */}
            {loadingPreview && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardDesigner;
