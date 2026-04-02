import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskListPage } from './pages/TaskListPage';
import { TaskDetailPage } from './pages/TaskDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<TaskListPage />} />
        <Route path="/tasks/:id"  element={<TaskDetailPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
