import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import * as XLSX from 'xlsx';

const InvitationCardGenerator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [templateImage, setTemplateImage] = useState(null);
  const [templatePreview, setTemplatePreview] = useState(null);
  const [qrPosition, setQrPosition] = useState({ x: 50, y: 50 });
  const [namePosition, setNamePosition] = useState({ x: 50, y: 80 });
  const [excelData, setExcelData] = useState(null);
  const [names, setNames] = useState([]);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  const templateRef = useRef();
  const qrDraggableRef = useRef();
  const nameDraggableRef = useRef();

  // Handle template image upload
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplateImage(file);
        setTemplatePreview(reader.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Excel file upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Extract names from Excel (assuming first column contains names)
        const nameList = jsonData.map(row => Object.values(row)[0]);
        setExcelData(jsonData);
        setNames(nameList);
        setStep(3);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Handle drag for positioning elements
  const handleDrag = (e, type) => {
    if (!templateRef.current) return;
    
    const rect = templateRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (type === 'qr') {
      setQrPosition({ x, y });
    } else {
      setNamePosition({ x, y });
    }
  };

  // Generate invitation cards
  const generateCards = () => {
    setIsGenerating(true);
    
    // Simulate generation process
    setTimeout(() => {
      const cards = names.map((name, index) => ({
        id: index + 1,
        name,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EventInvitation-${index + 1}`
      }));
      
      setGeneratedCards(cards);
      setStep(4);
      setIsGenerating(false);
    }, 2000);
  };

  // Download a specific card
  const downloadCard = (index) => {
    setCurrentCardIndex(index);
    // In a real application, this would actually download the image
    alert(`Downloading card for ${generatedCards[index].name}`);
  };

  // Download all cards as ZIP (simulated)
  const downloadAllCards = () => {
    alert('Downloading all cards as ZIP file');
  };

  return (
    <Layout>
         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Invitation Card Generator</h1>
          <p className="text-gray-600">Create personalized invitation cards with QR codes</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                <div className="text-sm mt-2 text-gray-600">
                  {stepNumber === 1 && 'Upload Template'}
                  {stepNumber === 2 && 'Position Elements'}
                  {stepNumber === 3 && 'Upload Names'}
                  {stepNumber === 4 && 'Generate Cards'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload Template */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Upload Your Invitation Template</h2>
            <p className="text-gray-600 mb-6">Upload a PNG or JPEG image that will serve as the background for your invitation cards.</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-4">Drag and drop your template here, or click to browse</p>
              <input
                type="file"
                id="template-upload"
                accept="image/png, image/jpeg"
                onChange={handleTemplateUpload}
                className="hidden"
              />
              <label htmlFor="template-upload" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 inline-block cursor-pointer">
                Select Template Image
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Position Elements */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Position QR Code and Name</h2>
            <p className="text-gray-600 mb-6">Drag the markers to position where the QR code and name should appear on your invitation.</p>
            
            <div className="relative mb-6" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              <img 
                ref={templateRef}
                src={templatePreview} 
                alt="Invitation template" 
                className="w-full rounded-lg border border-gray-300"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
              
              {/* QR Code Position Marker */}
              <div
                ref={qrDraggableRef}
                className="absolute w-8 h-8 bg-blue-600 rounded-full cursor-move flex items-center justify-center text-white"
                style={{ left: `${qrPosition.x}%`, top: `${qrPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                onDrag={(e) => handleDrag(e, 'qr')}
                draggable
              >
                <span className="text-xs">QR</span>
              </div>
              
              {/* Name Position Marker */}
              <div
                ref={nameDraggableRef}
                className="absolute w-8 h-8 bg-green-600 rounded-full cursor-move flex items-center justify-center text-white"
                style={{ left: `${namePosition.x}%`, top: `${namePosition.y}%`, transform: 'translate(-50%, -50%)' }}
                onDrag={(e) => handleDrag(e, 'name')}
                draggable
              >
                <span className="text-xs">Name</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Continue to Names Upload
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Names */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 3: Upload Guest Names</h2>
            <p className="text-gray-600 mb-6">Upload an Excel file containing the names of your guests. The system will generate one card per name.</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mb-4">Upload an Excel file (.xlsx) with guest names</p>
              <input
                type="file"
                id="excel-upload"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <label htmlFor="excel-upload" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 inline-block cursor-pointer">
                Upload Excel File
              </label>
            </div>
            
            {names.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Found {names.length} names:</h3>
                <div className="bg-gray-100 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {names.map((name, index) => (
                    <div key={index} className="text-gray-700 py-1 border-b border-gray-200 last:border-b-0">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Back
              </button>
              <button
                onClick={generateCards}
                disabled={names.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Generate Invitation Cards
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Generated Cards */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 4: Your Invitation Cards Are Ready!</h2>
            <p className="text-gray-600 mb-6">We've generated {generatedCards.length} personalized invitation cards.</p>
            
            {/* Card Preview */}
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-2">Preview of Card for {generatedCards[currentCardIndex]?.name}</h3>
              <div className="relative" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                <img 
                  src={templatePreview} 
                  alt="Invitation template" 
                  className="w-full rounded-lg border border-gray-300"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
                
                {/* QR Code Position */}
                <div
                  className="absolute"
                  style={{ left: `${qrPosition.x}%`, top: `${qrPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <img 
                    src={generatedCards[currentCardIndex]?.qrCode} 
                    alt="QR Code" 
                    className="w-16 h-16 md:w-24 md:h-24"
                  />
                </div>
                
                {/* Name Position */}
                <div
                  className="absolute text-xl font-bold text-gray-800 bg-white bg-opacity-70 px-2 py-1 rounded"
                  style={{ left: `${namePosition.x}%`, top: `${namePosition.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {generatedCards[currentCardIndex]?.name}
                </div>
              </div>
            </div>
            
            {/* Card Selector */}
            <div className="mb-6">
              <label htmlFor="card-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select a card to preview or download:
              </label>
              <select
                id="card-select"
                value={currentCardIndex}
                onChange={(e) => setCurrentCardIndex(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {generatedCards.map((card, index) => (
                  <option key={card.id} value={index}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <button
                onClick={() => downloadCard(currentCardIndex)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download This Card
              </button>
              
              <button
                onClick={downloadAllCards}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 9.5A3.5 3.5 0 005.5 13H9v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 15.586V13h2.5a4.5 4.5 0 10-.616-8.958 4.002 4.002 0 10-7.753 1.977A3.5 3.5 0 002 9.5zm9 3.5H9V8a1 1 0 012 0v5z" clipRule="evenodd" />
                </svg>
                Download All Cards (ZIP)
              </button>
              
              <button
                onClick={() => setStep(1)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Create New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default InvitationCardGenerator;