import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Splash } from "./pages/Splash";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Listings } from "./pages/Listings";
import { AccommodationDetails } from "./pages/AccommodationDetails";
import { Favoris } from "./pages/Favoris";
import { BuyCredits } from "./pages/BuyCredits";
import { Payment } from "./pages/Payment";
import { PaymentCallback } from "./pages/PaymentCallback";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { TransactionHistory } from "./pages/TransactionHistory";
import { Profile } from "./pages/Profile";
import { Parrainage } from "./pages/Parrainage";
import { AProposPage, ContactPage } from "./pages/Simple";
import { SetPassword } from "./pages/SetPassword";

import { OwnerLanding } from "./portals/owner/OwnerLanding";
import { OwnerLogin } from "./portals/owner/OwnerLogin";
import { OwnerSignup } from "./portals/owner/OwnerSignup";
import { OwnerGuard } from "./portals/owner/OwnerGuard";
import { OwnerSidebarLayout } from "./portals/owner/OwnerSidebarLayout";
import { PublishStart } from "./portals/owner/PublishStart";
import { PublishWizard } from "./portals/owner/PublishWizard";
import { PublishSuccess } from "./portals/owner/PublishSuccess";
import { OwnerDashboard } from "./portals/owner/OwnerDashboard";
import { OwnerListings } from "./portals/owner/OwnerListings";
import { OwnerListingDetail } from "./portals/owner/OwnerListingDetail";
import { OwnerFavoris } from "./portals/owner/OwnerFavoris";
import { OwnerStatistiques } from "./portals/owner/OwnerStatistiques";
import { OwnerProfile } from "./portals/owner/OwnerProfile";

import { AdminLogin } from "./portals/admin/AdminLogin";
import { AdminSetPassword } from "./portals/admin/AdminSetPassword";
import { AdminGuard } from "./portals/admin/AdminGuard";
import { AdminLayout } from "./portals/admin/AdminLayout";
import { AdminDashboard } from "./portals/admin/AdminDashboard";
import { AnnoncesEnAttente } from "./portals/admin/AnnoncesEnAttente";
import { AdminProprietaires } from "./portals/admin/AdminProprietaires";
import { AdminProprietaireDetail } from "./portals/admin/AdminProprietaireDetail";
import { AdminEtudiants } from "./portals/admin/AdminEtudiants";
import { AdminEtudiantDetail } from "./portals/admin/AdminEtudiantDetail";
import { AnnonceVerification } from "./portals/admin/AnnonceVerification";
import { DemandeModifications } from "./portals/admin/DemandeModifications";
import { AnnoncePublieeConfirmation } from "./portals/admin/AnnoncePublieeConfirmation";
import { Signalements } from "./portals/admin/Signalements";
import { Paiements } from "./portals/admin/Paiements";
import { Statistiques } from "./portals/admin/Statistiques";
import { Administrateurs } from "./portals/admin/Administrateurs";
import { RolesPermissions } from "./portals/admin/RolesPermissions";
import { LogsActivite } from "./portals/admin/LogsActivite";
import { Avis } from "./portals/admin/Avis";
import { AdminSettings } from "./portals/admin/AdminSettings";
import { AdminPlaceholder } from "./portals/admin/AdminPlaceholder";
import { MessageSquare } from "lucide-react";

function AdminPortalRoutes({ base }: { base: "admin" | "superadmin" }) {
  return (
    <>
      <Route path={`/${base}/connexion`} element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path={`/${base}/tableau-de-bord`} element={<AdminDashboard />} />
          <Route path={`/${base}/annonces`} element={<AnnoncesEnAttente />} />
          <Route path={`/${base}/annonces/:id`} element={<AnnonceVerification />} />
          <Route path={`/${base}/annonces/:id/modifications`} element={<DemandeModifications />} />
          <Route path={`/${base}/annonces/:id/publiee`} element={<AnnoncePublieeConfirmation />} />
          <Route path={`/${base}/avis`} element={<Avis />} />
          <Route path={`/${base}/signalements`} element={<Signalements />} />
          <Route path={`/${base}/paiements`} element={<Paiements />} />
          <Route path={`/${base}/statistiques`} element={<Statistiques />} />
          <Route path={`/${base}/proprietaires`} element={<AdminProprietaires />} />
          <Route path={`/${base}/proprietaires/:id`} element={<AdminProprietaireDetail />} />
          <Route path={`/${base}/etudiants`} element={<AdminEtudiants />} />
          <Route path={`/${base}/etudiants/:id`} element={<AdminEtudiantDetail />} />
          <Route
            path={`/${base}/messages`}
            element={<AdminPlaceholder icon={MessageSquare} title="Messages" description="Messagerie interne avec les utilisateurs." />}
          />
          <Route path={`/${base}/parametres`} element={<AdminSettings />} />
          {base === "superadmin" && (
            <>
              <Route path="/superadmin/administrateurs" element={<Administrateurs />} />
              <Route path="/superadmin/roles" element={<RolesPermissions />} />
              <Route path="/superadmin/logs" element={<LogsActivite />} />
            </>
          )}
        </Route>
      </Route>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/definir-mot-de-passe" element={<SetPassword />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/logements" element={<Listings />} />
        <Route path="/logements/:id" element={<AccommodationDetails />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/credits/achat" element={<BuyCredits />} />
        <Route path="/credits/paiement" element={<Payment />} />
        <Route path="/credits/paiement/retour" element={<PaymentCallback />} />
        <Route path="/credits/succes" element={<PaymentSuccess />} />
        <Route path="/credits/historique" element={<TransactionHistory />} />
        <Route path="/parrainage" element={<Parrainage />} />
        <Route path="/a-propos" element={<AProposPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Parcours propriétaire */}
      <Route path="/proprietaire" element={<OwnerLanding />} />
      <Route path="/proprietaire/connexion" element={<OwnerLogin />} />
      <Route path="/proprietaire/inscription" element={<OwnerSignup />} />
      <Route element={<OwnerGuard />}>
        <Route element={<OwnerSidebarLayout />}>
          <Route path="/proprietaire/publier" element={<PublishStart />} />
          <Route path="/proprietaire/publier/etapes" element={<PublishWizard />} />
          <Route path="/proprietaire/publier/succes" element={<PublishSuccess />} />
          <Route path="/proprietaire/tableau-de-bord" element={<OwnerDashboard />} />
          <Route path="/proprietaire/annonces" element={<OwnerListings />} />
          <Route path="/proprietaire/annonces/:id" element={<OwnerListingDetail />} />
          <Route path="/proprietaire/annonces/:id/modifier" element={<PublishWizard />} />
          <Route path="/proprietaire/favoris" element={<OwnerFavoris />} />
          <Route path="/proprietaire/statistiques" element={<OwnerStatistiques />} />
          <Route path="/proprietaire/profil" element={<OwnerProfile />} />
        </Route>
      </Route>

      {/* Parcours administrateur */}
      <Route path="/admin/definir-mot-de-passe" element={<AdminSetPassword />} />
      {AdminPortalRoutes({ base: "admin" })}

      {/* Parcours super admin */}
      {AdminPortalRoutes({ base: "superadmin" })}

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
