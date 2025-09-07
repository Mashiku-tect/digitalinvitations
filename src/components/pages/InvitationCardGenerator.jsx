import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Layout from "../layout/Layout";
import axios from "axios";

const fonts = [
  // Basic system fonts
  "Arial", 
  "Times New Roman", 
  "Courier New", 
  "Cursive", 

  // Modern sans-serif
  "Montserrat", 
  "Lato", 
  "Roboto", 
  "Open Sans", 
  "Poppins", 
  "Nunito", 
  "Inter",

  // Elegant serif (great for wedding cards, formal business)
  "Playfair Display", 
  "Merriweather", 
  "Cinzel", 
  "Cormorant Garamond", 
  "Libre Baskerville",

  // Script & decorative (good for wedding, invitations, posters)
  "Great Vibes", 
  "Dancing Script", 
  "Pacifico", 
  "Satisfy", 
  "Allura", 
  "Alex Brush",

  // Display fonts (for posters and eye-catching designs)
  "Bebas Neue", 
  "Oswald", 
  "Anton", 
  "Raleway", 
  "Abril Fatface", 
  "Lobster", 
  "Fredoka", 
  "Baloo 2"
];

const CardDesigner = () => {
  const [image, setImage] = useState(null);
  const [imageFileType, setImageFileType] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [qrUrlTemplate, setQrUrlTemplate] = useState(
    "https://example.com/invite?guestId={GUEST_ID}&eventId={EVENT_ID}&token={QR_TOKEN}"
  );
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [guests, setGuests] = useState([]);

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
      id: "type",
      label: "Type",
      x: 50,
      y: 100,
      width: 120,
      height: 30,
      fontSize: 18,
      fontFamily: "Arial",
      color: "blue",
    },
    {
      id: "qr",
      label: "QR",
      x: 100,
      y: 200,
      width: 100,
      height: 100,
      color: "#000000",
    },
  ]);

  const [selectedId, setSelectedId] = useState(null);
  const [guestNames, setGuestNames] = useState([]);
  const [guestTypes, setGuestTypes] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/getallevents', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const updatePlaceholder = (id, updates) => {
    setPlaceholders((prev) =>
      prev.map((ph) => (ph.id === id ? { ...ph, ...updates } : ph))
    );
  };

  // --- Image Upload ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Get file type
    const fileType = file.type.split('/')[1];
    setImageFileType(fileType);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      // Set reasonable maximum dimensions for the canvas
      const maxWidth = 1000;
      const maxHeight = 800;
      
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      // Scale down if image is too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      setImage(img.src);
      setImageSize({ width, height });
    };
  };

  // --- Event Selection ---
  const handleEventSelect = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    
    if (!eventId) {
      setGuestNames([]);
      setGuestTypes([]);
      setGuests([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/events/eventdetails/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Extract guest data from the response
      const guestData = response.data.event.Guests || response.data.guests || [];
      setGuests(guestData);
      
      const names = guestData.map(guest => 
        `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Guest'
      );
      
      const types = guestData.map(guest => 
  (guest.type || 'SINGLE').toUpperCase()
);

      
      setGuestNames(names);
      setGuestTypes(types);
      setPreviewIndex(0);
    } catch (error) {
      console.error('Error fetching event details:', error);
      alert('Failed to load event guests');
    }
  };

  // --- Generate QR Code URL with guest data ---
  const generateQrUrl = (guest) => {
    return qrUrlTemplate
      .replace("{GUEST_ID}", guest.id)
      .replace("{EVENT_ID}", guest.eventId)
      .replace("{QR_TOKEN}", guest.qrcodetoken);
  };

  // --- Preview Generator ---
  const generatePreview = async (guestIndex) => {
    if (!image) return null;
    
    const guest = guests[guestIndex];
    const guestName = guestNames[guestIndex];
    const guestType = guestTypes[guestIndex];

    const canvas = document.createElement("canvas");
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;
    const ctx = canvas.getContext("2d");

    const bgImage = new Image();
    bgImage.src = image;
    await new Promise((resolve) => (bgImage.onload = resolve));
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    for (const ph of placeholders) {
      if (ph.id === "name") {
        ctx.fillStyle = ph.color;
        ctx.font = `${ph.fontSize}px ${ph.fontFamily}`;
        ctx.fillText(guestName, ph.x, ph.y + ph.fontSize);
      }
      if (ph.id === "type") {
        ctx.fillStyle = ph.color;
        ctx.font = `${ph.fontSize}px ${ph.fontFamily}`;
        ctx.fillText(guestType, ph.x, ph.y + ph.fontSize);
      }
      if (ph.id === "qr") {
        // Generate QR code using guest data
        const qrData = generateQrUrl(guest);
        const qrDataUrl = await QRCode.toDataURL(
          qrData,
          { color: { dark: ph.color, light: "#ffffff" }, width: ph.width, margin: 0 }
        );
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => (qrImg.onload = resolve));
        ctx.drawImage(qrImg, ph.x, ph.y, ph.width, ph.height);
      }
    }

    return canvas.toDataURL("image/png");
  };

  // --- Generate Blob for Upload ---
  const generateCardBlob = async (guestIndex) => {
    const dataUrl = await generatePreview(guestIndex);
    const response = await fetch(dataUrl);
    return await response.blob();
  };

  // --- Publish Cards ---
  const publishCards = async () => {
    if (!selectedEvent || !guests.length || !image) {
      alert("Please select an event, upload an image, and ensure guests are loaded");
      return;
    }

    setPublishing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      for (let i = 0; i < guests.length; i++) {
        const guest = guests[i];
        
        // Generate card blob
        const blob = await generateCardBlob(i);
        
        // Create form data for upload
        const formData = new FormData();
        formData.append('card', blob, `${guest.firstName}_${guest.lastName}_${guest.id}.${imageFileType || 'png'}`);
        formData.append('eventId', selectedEvent);
        formData.append('guestId', guest.id);
        
        // Upload card to server
        const response = await axios.post(
          'http://localhost:5000/api/events/uploadcard',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log(`Card uploaded for ${guestNames[i]}:`, response.data);
      }
      
      alert('All cards published successfully!');
    } catch (error) {
      console.error('Error publishing cards:', error);
      alert('Failed to publish some cards. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  // --- Refresh Preview manually ---
  const refreshPreview = async () => {
    if (guests.length > 0) {
      setLoadingPreview(true);
      const dataUrl = await generatePreview(previewIndex);
      setPreviewDataUrl(dataUrl);
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (guests.length > 0) {
      generatePreview(previewIndex).then(setPreviewDataUrl);
    }
  }, [guests, placeholders, previewIndex]);

  // --- Navigation ---
  const prevGuest = () => setPreviewIndex(Math.max(previewIndex - 1, 0));
  const nextGuest = () =>
    setPreviewIndex(Math.min(previewIndex + 1, guests.length - 1));

  // --- Download All ---
  const downloadAllInvitations = async () => {
    if (!guests.length || !image) return;
    const zip = new JSZip();

    for (let i = 0; i < guests.length; i++) {
      const guestName = guestNames[i];
      const dataUrl = await generatePreview(i);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      zip.file(`${guestName}_invitation.png`, blob);
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Event
              </label>
              <select
                value={selectedEvent}
                onChange={handleEventSelect}
                className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500"
                disabled={loadingEvents}
              >
                <option value="">-- Select an Event --</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {loadingEvents && (
                <p className="text-sm text-gray-500 mt-1">Loading events...</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR URL Template
              </label>
              <input
                type="text"
                value={qrUrlTemplate}
                onChange={(e) => setQrUrlTemplate(e.target.value)}
                placeholder="https://example.com/invite?guestId={GUEST_ID}&eventId={EVENT_ID}&token={QR_TOKEN}"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {"{GUEST_ID}"}, {"{EVENT_ID}"}, and {"{QR_TOKEN}"} as placeholders
              </p>
            </div>
          </div>

          {/* Customization Panel */}
          {selectedId && (
            <div className="bg-white p-4 rounded-xl shadow space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Edit {selectedId}</h2>
              {(selectedId === "name" || selectedId === "type") && (
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
          {guests.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={prevGuest}
                  disabled={previewIndex === 0}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={nextGuest}
                  disabled={previewIndex === guests.length - 1}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>

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

              <div className="flex gap-3">
                <button
                  onClick={downloadAllInvitations}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Download All
                </button>
                
                <button
                  onClick={publishCards}
                  disabled={publishing}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {publishing ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Publishing...
                    </>
                  ) : (
                    "Publish Cards"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Designer Canvas */}
        <div className="flex-shrink-0 overflow-auto max-w-full">
          <div
            className="relative bg-white border rounded-xl shadow-lg overflow-hidden mx-auto"
            style={{ width: imageSize.width, height: imageSize.height, maxWidth: '100%' }}
          >
            {/* --- EDIT MODE --- */}
            {!showPreview && image && (
              <>
                <img
                  src={image}
                  alt="Card"
                  className="absolute top-0 left-0 w-full h-full object-contain"
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
                      borderColor: ph.id === "name" ? "#ef4444" : ph.id === "type" ? "#3b82f6" : "#9ca3af",
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
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            )}

            {/* --- Loading Overlay --- */}
            {loadingPreview && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></span>
              </div>
            )}
            
            {/* --- No Image Placeholder --- */}
            {!image && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p>Upload an image to begin designing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardDesigner;