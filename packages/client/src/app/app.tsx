// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';

import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import FileView from './components/FileView';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/file/:shareId" element={<FileView />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
