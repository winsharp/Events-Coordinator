import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import './App.css'
import HomePage from './pages/HomePage/HomePage'

function PageLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<PageLayout/>}>
            <Route element={<HomePage />} index/>
            <Route path='home' element={<HomePage />} index/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
