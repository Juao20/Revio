import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/register" className="text-indigo-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-white font-bold">Conditions d'utilisation</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        <div className="text-center">
          <span className="text-4xl block mb-3">📄</span>
          <h1 className="text-3xl font-bold text-white">Conditions d'utilisation</h1>
          <p className="text-indigo-400 text-sm mt-2">Dernière mise à jour : juin 2026</p>
        </div>

        {[
          {
            title: '1. Acceptation des conditions',
            content: `En accédant à Revio et en l'utilisant, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service. Revio se réserve le droit de modifier ces conditions à tout moment.`,
          },
          {
            title: '2. Description du service',
            content: `Revio est une plateforme d'apprentissage assistée par intelligence artificielle qui transforme vos cours en outils de révision personnalisés : flashcards, quiz, résumés et plans de révision. Le service est disponible en version gratuite et en version Premium.`,
          },
          {
            title: '3. Compte utilisateur',
            content: `Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion. Vous acceptez de ne pas partager votre compte avec d'autres personnes. Revio se réserve le droit de suspendre ou supprimer tout compte en cas d'utilisation abusive.`,
          },
          {
            title: '4. Abonnement Premium',
            content: `L'abonnement Premium est disponible à $5.99/mois ou $49/an. Le paiement est traité de manière sécurisée via LemonSqueezy. Les abonnements se renouvellent automatiquement. Vous pouvez annuler à tout moment depuis votre espace client LemonSqueezy. Aucun remboursement n'est accordé pour les périodes déjà facturées.`,
          },
          {
            title: '5. Utilisation acceptable',
            content: `Vous vous engagez à utiliser Revio uniquement à des fins légales et éducatives. Il est interdit d'utiliser notre service pour générer du contenu illégal, trompeur ou nuisible. Toute tentative de contournement des limitations du service est interdite.`,
          },
          {
            title: '6. Propriété intellectuelle',
            content: `Le contenu que vous uploadez reste votre propriété. En l'uploadant sur Revio, vous nous accordez une licence limitée pour traiter ce contenu via notre IA afin de générer vos outils de révision. Le contenu généré par notre IA est mis à votre disposition pour un usage personnel et éducatif uniquement.`,
          },
          {
            title: '7. Limitation de responsabilité',
            content: `Revio est fourni "tel quel" sans garantie d'aucune sorte. Nous ne garantissons pas l'exactitude du contenu généré par l'IA. Revio ne saurait être tenu responsable des résultats académiques obtenus en utilisant notre service.`,
          },
          {
            title: '8. Protection des données',
            content: `Nous collectons et traitons vos données personnelles conformément à notre Politique de confidentialité. Vos cours uploadés sont stockés de manière sécurisée et ne sont jamais partagés avec des tiers sans votre consentement.`,
          },
          {
            title: '9. Résiliation',
            content: `Vous pouvez supprimer votre compte à tout moment. Revio se réserve le droit de résilier votre accès en cas de violation de ces conditions. En cas de résiliation, vos données seront supprimées dans un délai de 30 jours.`,
          },
          {
            title: '10. Contact',
            content: `Pour toute question concernant ces conditions d'utilisation, contactez-nous à : support@revio.app`,
          },
        ].map((section, i) => (
          <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-3">{section.title}</h2>
            <p className="text-indigo-200 text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}

      </div>
    </div>
  )
}