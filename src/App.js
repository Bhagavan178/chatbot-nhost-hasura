import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NhostClient, AuthProvider, HasuraProvider } from '@nhost/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import nhostConfig from '../nhost.config.js';

// Initialize Nhost client with configuration
const nhost = new NhostClient(nhostConfig);

// Create query client
const queryClient = new QueryClient();

// Components
import Auth from './components/Auth';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import Navbar from './components/Navbar';
import Recaptcha from './components/Recaptcha';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <AuthProvider nhost={nhost}>
        <HasuraProvider nhost={nhost}>
          <QueryClientProvider client={queryClient}>
            <Router>
              <div className="min-h-screen bg-gray-100">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<ChatList />} />
                    <Route path="/chat/:chatId" element={<Chat />} />
                    <Route path="/recaptcha" element={<Recaptcha />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </QueryClientProvider>
        </HasuraProvider>
      </AuthProvider>
    </NhostProvider>
  );
}

export default App;
