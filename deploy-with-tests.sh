#!/bin/bash
# Script de déploiement avec tests automatiques

set -e  # Arrêter en cas d'erreur

echo "🚀 Début du déploiement avec validation"
echo "========================================"

# 1. Tests unitaires frontend
echo ""
echo "📋 Étape 1/3 : Tests unitaires React"
echo "------------------------------------"
cd /var/www/cppeurope/frontend
CI=true npm test -- --watchAll=false --passWithNoTests || {
    echo "❌ Tests unitaires échoués"
    exit 1
}
echo "✅ Tests unitaires réussis"

# 2. Tests E2E Cypress (si serveur tourne déjà)
echo ""
echo "📋 Étape 2/3 : Tests E2E Cypress"
echo "--------------------------------"
# Note: Nécessite que l'app soit déjà lancée sur localhost:3000
# ou modifier cypress.config.js pour pointer vers production
if [ "$SKIP_E2E" != "true" ]; then
    npm run cypress:run || {
        echo "⚠️  Tests E2E échoués"
        echo "💡 Pour ignorer: SKIP_E2E=true ./deploy-with-tests.sh"
        exit 1
    }
    echo "✅ Tests E2E réussis"
else
    echo "⏭️  Tests E2E ignorés (SKIP_E2E=true)"
fi

# 3. Build production
echo ""
echo "📋 Étape 3/3 : Build production"
echo "-------------------------------"
npm run build || {
    echo "❌ Build échoué"
    exit 1
}
echo "✅ Build réussi"

# 4. Déploiement (adapter selon votre méthode)
echo ""
echo "🎉 Tous les tests passent - Prêt pour déploiement"
echo "=================================================="
echo ""
echo "Pour déployer maintenant:"
echo "  - docker compose down && docker compose up -d --build"
echo "  - ou copiez le build/ vers votre serveur"
echo ""
