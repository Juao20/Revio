import { Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg font-sans">
      <nav className="border-b border-white/8 px-6 py-4 flex items-center gap-4">
        <Link to="/register" aria-label="Retour" className="w-9 h-9 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center text-text-soft hover:text-text transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <span className="font-bold">Politique de confidentialité</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/14 flex items-center justify-center mx-auto mb-3">
            <Lock size={26} className="text-accent" />
          </div>
          <h1 className="text-2xl font-extrabold">Politique de confidentialité</h1>
          <p className="text-text-faint text-sm mt-2">Dernière mise à jour : juin 2026</p>
        </div>

        {[
          {
            title: '1. Données collectées',
            content: `Nous collectons les données suivantes : informations de compte (nom d'utilisateur, email, mot de passe chiffré), contenu uploadé (cours, fichiers PDF), données d'utilisation (sessions de quiz, scores, activité de révision).`,
          },
          {
            title: '2. Utilisation des données',
            content: `Vos données sont utilisées pour : fournir et améliorer le service Revio, générer vos outils de révision personnalisés via notre IA, suivre votre progression et calculer votre maîtrise, vous envoyer des notifications liées à votre compte (si activées).`,
          },
          {
            title: '3. Stockage et sécurité',
            content: `Vos données sont stockées sur des serveurs sécurisés (Render). Les mots de passe sont chiffrés avec l'algorithme bcrypt. Les fichiers PDF sont stockés de manière sécurisée sur Cloudinary. Nous utilisons HTTPS pour toutes les communications. Nous ne vendons jamais vos données à des tiers.`,
          },
          {
            title: '4. Partage des données',
            content: `Nous partageons vos données uniquement avec : Groq (traitement IA de vos cours — données non conservées après traitement), Cloudinary (stockage des fichiers PDF uploadés). Aucun partage à des fins publicitaires.`,
          },
          {
            title: '5. Cookies',
            content: `Revio utilise uniquement des cookies essentiels au fonctionnement du service (authentification, préférences). Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.`,
          },
          {
            title: '6. Vos droits',
            content: `Conformément au RGPD, vous disposez des droits suivants : droit d'accès à vos données, droit de rectification, droit à l'effacement (droit à l'oubli), droit à la portabilité, droit d'opposition. Pour exercer ces droits, contactez-nous à : privacy@revio.app`,
          },
          {
            title: '7. Conservation des données',
            content: `Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont effacées dans un délai de 30 jours.`,
          },
          {
            title: '8. Mineurs',
            content: `Revio n'est pas destiné aux enfants de moins de 13 ans. Si vous avez moins de 16 ans, l'accord d'un parent ou tuteur est requis pour utiliser notre service.`,
          },
          {
            title: '9. Modifications',
            content: `Nous pouvons mettre à jour cette politique à tout moment. Vous serez notifié par email en cas de modification substantielle. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions.`,
          },
          {
            title: '10. Contact',
            content: `Pour toute question concernant la protection de vos données : privacy@revio.app`,
          },
        ].map((section, i) => (
          <div key={i} className="bg-surface border border-white/8 rounded-2xl p-6">
            <h2 className="font-bold text-base mb-2.5">{section.title}</h2>
            <p className="text-text-soft text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}

      </div>
    </div>
  )
}