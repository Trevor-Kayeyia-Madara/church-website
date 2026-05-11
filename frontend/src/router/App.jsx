import { Routes, Route } from "react-router-dom";
import RootLayout from "./RootLayout.jsx";
import AdminLayout from "./AdminLayout.jsx";

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

import AdminHomePage from "@/app/admin/page.jsx";
import AdminLoginPage from "@/app/admin/login/page.jsx";
import AdminSermonsPage from "@/app/admin/sermons/page.jsx";
import AdminEventsPage from "@/app/admin/events/page.jsx";
import AdminPastorsPage from "@/app/admin/pastors/page.jsx";
import AdminGalleryPage from "@/app/admin/gallery/page.jsx";
import AdminMinistriesPage from "@/app/admin/ministries/page.jsx";
import AdminMessagesPage from "@/app/admin/messages/page.jsx";
import AdminSettingsPage from "@/app/admin/settings/page.jsx";
import AdminYouTubePage from "@/app/admin/youtube/page.jsx";

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

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="sermons" element={<AdminSermonsPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="pastors" element={<AdminPastorsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="ministries" element={<AdminMinistriesPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="youtube" element={<AdminYouTubePage />} />
        </Route>
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
