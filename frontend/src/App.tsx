import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./routes/Home";
import Signup from "./routes/Signup";
import Signin from "./routes/Signin";
import Profile from "./routes/Profile";
import ProfileEdit from "./routes/ProfileEdit";
import Calendar from "./routes/Calendar";
import EventDetail from "./routes/EventDetail";
import EventCreate from "./routes/EventCreate";
import Feed from "./routes/Feed";
import Friends from "./routes/Friends";
import Discover from "./routes/Discover";
import DiscoverDetail from "./routes/DiscoverDetail";
import Suggestions from "./routes/Suggestions";
import OrganizerDashboard from "./routes/OrganizerDashboard";
import GoogleImport from "./routes/GoogleImport";
import Team from "./routes/Team";
import NotFound from "./routes/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppDispatch } from "./hooks";
import { fetchMe } from "./api/auth";
import { setUser, markLoaded } from "./store/session";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchMe().then((u) => {
      if (u) dispatch(setUser(u));
      else dispatch(markLoaded());
    });
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route
          path="/profile/me/edit"
          element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute>
              <EventCreate />
            </ProtectedRoute>
          }
        />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/:id" element={<DiscoverDetail />} />
        <Route
          path="/suggestions"
          element={
            <ProtectedRoute>
              <Suggestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute role="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gcal-import"
          element={
            <ProtectedRoute>
              <GoogleImport />
            </ProtectedRoute>
          }
        />
        <Route path="/team" element={<Team />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
