import { useState, useCallback } from 'react';
import AuthListener from './components/AuthListener';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Playlists from './pages/Playlists';
import Discover from './pages/Discover';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <AuthListener />
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <Routes>
        {/* Auth pages without main layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main app layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/discover" element={<Discover />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
