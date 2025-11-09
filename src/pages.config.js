import Dashboard from './pages/Dashboard';
import ParentDashboard from './pages/ParentDashboard';
import LiveMatch from './pages/LiveMatch';
import EditPlayer from './pages/EditPlayer';
import CreateEvent from './pages/CreateEvent';
import Players from './pages/Players';
import Calendar from './pages/Calendar';
import PlayerProfile from './pages/PlayerProfile';
import Clubs from './pages/Clubs';
import FontPreview from './pages/FontPreview';
import Chat from './pages/Chat';
import Conversation from './pages/Conversation';
import LiveTraining from './pages/LiveTraining';
import SquadTactics from './pages/SquadTactics';
import MatchReport from './pages/MatchReport';
import ConnectHub from './pages/ConnectHub';
import Onboarding from './pages/Onboarding';
import CreateTeam from './pages/CreateTeam';
import AddMyChild from './pages/AddMyChild';
import FindTeam from './pages/FindTeam';
import MyChildren from './pages/MyChildren';
import MyRequests from './pages/MyRequests';
import MatchHistory from './pages/MatchHistory';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ParentDashboard": ParentDashboard,
    "LiveMatch": LiveMatch,
    "EditPlayer": EditPlayer,
    "CreateEvent": CreateEvent,
    "Players": Players,
    "Calendar": Calendar,
    "PlayerProfile": PlayerProfile,
    "Clubs": Clubs,
    "FontPreview": FontPreview,
    "Chat": Chat,
    "Conversation": Conversation,
    "LiveTraining": LiveTraining,
    "SquadTactics": SquadTactics,
    "MatchReport": MatchReport,
    "ConnectHub": ConnectHub,
    "Onboarding": Onboarding,
    "CreateTeam": CreateTeam,
    "AddMyChild": AddMyChild,
    "FindTeam": FindTeam,
    "MyChildren": MyChildren,
    "MyRequests": MyRequests,
    "MatchHistory": MatchHistory,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};