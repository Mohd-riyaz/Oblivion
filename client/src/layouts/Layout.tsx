import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MusicPlayer from '../components/MusicPlayer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14 pb-24 md:pb-28">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
          <Outlet />
        </div>
      </main>
      <MusicPlayer />
    </div>
  );
}
