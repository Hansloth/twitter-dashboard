import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./view/Home.js";
import SubSearch from "./view/SubSearch.js";
import Search from "./view/Search.js";
import About from "./view/About.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="subsearch" element={<SubSearch />} />
          <Route path="search" element={<Search />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
