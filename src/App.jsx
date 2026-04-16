import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AppProvider } from './context/AppContext';
import BookingsPage from './pages/BookingsPage';
import DetailPage from './pages/DetailPage';
import ExplorePage from './pages/ExplorePage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import StudioPage from './pages/StudioPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="items/:id" element={<DetailPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="studio" element={<StudioPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
