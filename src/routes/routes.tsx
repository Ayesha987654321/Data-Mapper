import Home from '../pages/home';
import UploadFiles from '../pages/uploadFiles';
import Login from '../pages/login';
import Register from '../pages/register';
import ProtectedRoute from './protectedRoutes';
import { Navigate } from 'react-router-dom';
import FileHistory from '../pages/fileHistory';



const routes = () => [
  { path: '/', element: <Navigate to="/uploadFiles" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { 
    path: '/home', 
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/filesHistory', 
    element: (
      <ProtectedRoute>
        <FileHistory />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/uploadFiles', 
    element: (
      <ProtectedRoute>
        <UploadFiles />
      </ProtectedRoute>
    ) 
  },
];

export default routes;