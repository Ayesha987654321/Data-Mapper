import './App.css';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './layout';
import './styles/global.css';
import routes from './routes/routes';

function App() {
  return (
    <>
      <Routes>
        {routes().map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              route.path === '/login' || route.path === '/register' ? 
                route.element : 
                <MainLayout>{route.element}</MainLayout>
            }
          />
        ))}
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;