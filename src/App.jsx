// App.jsx — Oleena Wedding Planner
// Root component — routes render here
// TODO: When adding React Router, replace LoginPage with a <Routes> / <Route> structure

import LoginPage from './pages/LoginPage';

function App() {
  return (
    // Temporarily rendering LoginPage directly.
    // TODO: Wrap with <BrowserRouter> and <Routes> when adding navigation.
    <LoginPage />
  );
}

export default App;
