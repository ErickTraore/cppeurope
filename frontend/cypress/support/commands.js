// ***********************************************
// Custom Cypress commands
// ***********************************************

// Commande pour se connecter et aller directement à la page admin presse
Cypress.Commands.add('login', (email = 'cppeurope@gmail.com', password = 'cppeurope2025') => {
  cy.visit('/#auth')
  cy.reload(true) // Force cache refresh
  cy.wait(500)
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').contains(/connecter/i).click()
  cy.wait(2000)
  
  // ⚠️ CRITIQUE : La modale de prolongation apparaît IMMÉDIATEMENT après login pendant 60 secondes
  // Il faut la cliquer AVANT qu'elle disparaisse, sinon elle bloquera les tests
  cy.prolongSession()
  
  // Vérifier que le token est bien stocké
  cy.window().then((win) => {
    const token = win.localStorage.getItem('accessToken')
    if (!token) {
      throw new Error('❌ Login failed: no accessToken in localStorage')
    }
  })
})

// Commande pour prolonger la session ou fermer la modale
// ⚠️ CRITIQUE : La modale s'affiche IMMÉDIATEMENT après login pendant 60 secondes
// Il FAUT la cliquer AVANT qu'elle disparaisse, sinon elle bloquera les tests
Cypress.Commands.add('prolongSession', () => {
  // Essayer de trouver et cliquer le bouton de prolongation
  // Si le bouton n'existe pas, ce n'est pas une erreur
  cy.get('body', { timeout: 1000 }).then($body => {
    // Chercher tous les boutons
    const buttons = $body.find('button')
    
    buttons.each((i, btn) => {
      const text = btn.textContent.toUpperCase()
      if (text.includes('PROLONGER') || text.includes('CONTINUER') || text.includes('OK')) {
        // Cliquer sur le bouton avec force:true
        Cypress.$(btn).click()
        return false // break
      }
    })
  })
  
  cy.wait(300)
})

// Commande pour aller à la page admin presse générale
Cypress.Commands.add('goToPresseAdmin', () => {
  // ✅ Fermer la modale si elle est toujours visible
  cy.prolongSession()
  
  // ✅ Visiter directement la page (cy.visit() rechargera la page complètement)
  // React devrait recharger le localStorage et l'utiliser pour l'authentification
  cy.visit('/#admin-presse-générale', { 
    timeout: 10000,
    // Garder les cookies et localStorage
    onBeforeLoad: (win) => {
      // On ne fait rien, juste laisser Cypress continuer
    }
  })
  
  cy.wait(2000)
  
  // ✅ Fermer la modale encore une fois
  cy.prolongSession()
  
  // ✅ Attendre le wrapper
  cy.get('.presse-wrapper', { timeout: 10000 }).should('be.visible')
})
