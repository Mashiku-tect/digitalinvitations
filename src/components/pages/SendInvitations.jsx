import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';

const SendInvitations = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(`You're invited to our special event! We can't wait to celebrate with you.`);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendMethod, setSendMethod] = useState('both'); // 'sms', 'whatsapp', 'both'

  // Sample data - in a real app this would come from props or context
  const guests = [
    { id: 1, name: 'John Doe', phone: '+255123456789', cardUrl: '#', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=JohnDoe-1' },
    { id: 2, name: 'Jane Smith', phone: '+255987654321', cardUrl: '#', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=JaneSmith-2' },
    { id: 3, name: 'Robert Johnson', phone: '+255555123456', cardUrl: '#', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RobertJohnson-3' },
    { id: 4, name: 'Sarah Williams', phone: '+255777888999', cardUrl: '#', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SarahWilliams-4' },
    { id: 5, name: 'Michael Brown', phone: '+255444555666', cardUrl: '#', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MichaelBrown-5' },
  ];

  // Toggle selection for all guests
  const toggleSelectAll = () => {
    if (selectedGuests.length === guests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(guests.map(guest => guest.id));
    }
  };

  // Toggle selection for a single guest
  const toggleGuestSelection = (id) => {
    if (selectedGuests.includes(id)) {
      setSelectedGuests(selectedGuests.filter(guestId => guestId !== id));
    } else {
      setSelectedGuests([...selectedGuests, id]);
    }
  };

  // Send invitations
  const sendInvitations = () => {
    if (selectedGuests.length === 0) {
      alert('Please select at least one guest to send invitations to.');
      return;
    }

    setSending(true);
    setSendProgress(0);
    
    // Simulate sending process
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSending(false);
          alert('Invitations sent successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Preview message with guest name
  const previewMessage = (guestName = 'Guest') => {
    return message.replace(/{name}/g, guestName);
  };

  return (
    <Layout>

         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Send Invitations</h1>
          <p className="text-gray-600">Send personalized invitations via SMS and WhatsApp</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Message Composition */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Compose Your Message</h2>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Message *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your invitation message here..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Use <code className="bg-gray-100 px-1 py-0.5 rounded">{'{name}'}</code> to personalize with guest names
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send Via *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sendMethod"
                      value="both"
                      checked={sendMethod === 'both'}
                      onChange={() => setSendMethod('both')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Both SMS & WhatsApp</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sendMethod"
                      value="sms"
                      checked={sendMethod === 'sms'}
                      onChange={() => setSendMethod('sms')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">SMS Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sendMethod"
                      value="whatsapp"
                      checked={sendMethod === 'whatsapp'}
                      onChange={() => setSendMethod('whatsapp')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">WhatsApp Only</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Message Preview:</h3>
                <p className="text-blue-700">{previewMessage()}</p>
              </div>
            </div>

            {/* Send Button */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Send to {selectedGuests.length} {selectedGuests.length === 1 ? 'guest' : 'guests'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {sendMethod === 'both' && 'Via SMS and WhatsApp'}
                    {sendMethod === 'sms' && 'Via SMS only'}
                    {sendMethod === 'whatsapp' && 'Via WhatsApp only'}
                  </p>
                </div>
                <button
                  onClick={sendInvitations}
                  disabled={sending || selectedGuests.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      Send Invitations
                    </>
                  )}
                </button>
              </div>

              {sending && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Sending progress</span>
                    <span>{sendProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${sendProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Guest List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Guest List</h2>
                <button
                  onClick={toggleSelectAll}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedGuests.length === guests.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search guests..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {guests.map(guest => (
                  <div 
                    key={guest.id} 
                    className={`flex items-center p-3 rounded-lg border ${selectedGuests.includes(guest.id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGuests.includes(guest.id)}
                      onChange={() => toggleGuestSelection(guest.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                      <p className="text-xs text-gray-500">{guest.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        SMS
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        WhatsApp
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total guests</span>
                  <span className="font-medium">{guests.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Selected guests</span>
                  <span className="font-medium text-blue-600">{selectedGuests.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default SendInvitations;