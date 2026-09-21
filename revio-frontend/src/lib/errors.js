// Traduit une erreur axios en message compréhensible par un étudiant.
// Le backend renvoie parfois { error: "..." } avec un message déjà utilisable :
// on le garde tel quel. Sinon on retombe sur un message générique selon le code HTTP.
export function getErrorMessage(err, fallback = "Une erreur est survenue. Réessaie dans un instant.") {
  const backendMessage = err?.response?.data?.error
  if (typeof backendMessage === "string" && backendMessage.trim()) {
    return backendMessage
  }

  const status = err?.response?.status
  if (status === 404) return "Introuvable."
  if (status === 403) return "Tu n'as pas accès à cette action."
  if (status >= 500) return "Le serveur a un souci. Réessaie dans un instant."
  if (!err?.response) return "Impossible de contacter le serveur. Vérifie ta connexion."

  return fallback
}
