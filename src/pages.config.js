import AddMyChild from './pages/AddMyChild';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import Clubs from './pages/Clubs';
import ConnectHub from './pages/ConnectHub';
import Conversation from './pages/Conversation';
import CreateEvent from './pages/CreateEvent';
import CreateTeam from './pages/CreateTeam';
import Dashboard from './pages/Dashboard';
import EditPlayer from './pages/EditPlayer';
import FindTeam from './pages/FindTeam';
import FontPreview from './pages/FontPreview';
import Home from './pages/Home';
import LiveMatch from './pages/LiveMatch';
import LiveTraining from './pages/LiveTraining';
import MatchHistory from './pages/MatchHistory';
import MatchReport from './pages/MatchReport';
import MyChildren from './pages/MyChildren';
import MyRequests from './pages/MyRequests';
import Onboarding from './pages/Onboarding';
import ParentDashboard from './pages/ParentDashboard';
import PlayerProfile from './pages/PlayerProfile';
import Players from './pages/Players';
import SquadTactics from './pages/SquadTactics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddMyChild": AddMyChild,
    "Calendar": Calendar,
    "Chat": Chat,
    "Clubs": Clubs,
    "ConnectHub": ConnectHub,
    "Conversation": Conversation,
    "CreateEvent": CreateEvent,
    "CreateTeam": CreateTeam,
    "Dashboard": Dashboard,
    "EditPlayer": EditPlayer,
    "FindTeam": FindTeam,
    "FontPreview": FontPreview,
    "Home": Home,
    "LiveMatch": LiveMatch,
    "LiveTraining": LiveTraining,
    "MatchHistory": MatchHistory,
    "MatchReport": MatchReport,
    "MyChildren": MyChildren,
    "MyRequests": MyRequests,
    "Onboarding": Onboarding,
    "ParentDashboard": ParentDashboard,
    "PlayerProfile": PlayerProfile,
    "Players": Players,
    "SquadTactics": SquadTactics,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};