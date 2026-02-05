/// <reference types="cypress" />

describe('Presse Générale - Vérification admin cppeurope@gmail.com', () => {
  it('vérifie si cppeurope@gmail.com est admin', () => {
    // Login avec les credentials
    cy.login('cppeurope@gmail.com', 'cppeurope2025')
    
    // Essayer d'accéder à l'admin presse générale (avec hash)
    cy.visit('https://cppeurope.net/#admin-presse-générale')
    
    cy.wait(1000)
    
    // Vérifier qu'on a accès (le select presse existe = on est admin)
    cy.get('select.presse-select', { timeout: 5000 }).should('be.visible')
    
    cy.log('✅ cppeurope@gmail.com EST ADMIN')
  })
})
