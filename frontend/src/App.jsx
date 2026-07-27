import { Routes, Route, Navigate } from "react-router-dom";
import Workspace from "./pages/Workspace";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/workspace/6a670514c30427629e4683fd" replace />}
      />

      <Route path="/workspace/:id" element={<Workspace />} />
    </Routes>
  );
}

export default App;