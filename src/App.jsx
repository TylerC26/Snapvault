import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EventCodeEntry from './components/EventCodeEntry';
import EventGallery from './components/EventGallery';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventCodeEntry />} />
        <Route path="/event/:code" element={<EventGallery />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
