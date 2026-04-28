import { Routes, Route } from "react-router-dom";
import RootLayout from "./RootLayout.jsx";

import HomePage from "@/app/page.jsx";
import AboutPage from "@/app/about/page.jsx";
import JourneyPage from "@/app/about/journey/page.jsx";
import LeadershipPage from "@/app/about/leadership/page.jsx";
import MissionVisionPage from "@/app/about/mission-vision/page.jsx";
import MinistriesPage from "@/app/ministries/page.jsx";
import SermonsPage from "@/app/sermons/page.jsx";
import SermonDetailPage from "../pages/SermonDetailPage.jsx";
import SchoolPage from "@/app/school/page.jsx";
import ContactPage from "@/app/contact/page.jsx";
import NotFound from "@/app/not-found.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/journey" element={<JourneyPage />} />
        <Route path="/about/leadership" element={<LeadershipPage />} />
        <Route path="/about/mission-vision" element={<MissionVisionPage />} />
        <Route path="/ministries" element={<MinistriesPage />} />
        <Route path="/sermons" element={<SermonsPage />} />
        <Route path="/sermons/:id" element={<SermonDetailPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
