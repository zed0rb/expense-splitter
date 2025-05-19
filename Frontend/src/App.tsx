import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
