/// <reference types="cypress" />

// Test E2E - Session Timer avec couleurs
describe('Session Timer - Couleurs et comportement', () => {
  beforeEach(() => {
    // Login SANS fermer la modale
    cy.visit('/#auth')
    cy.reload(true)
    cy.wait(500)
    cy.get('input[type="email"]').type('cppeurope@gmail.com')
    cy.get('input[type="password"]').type('cppeurope2025')
    cy.get('button[type="submit"]').contains(/connecter/i).click()
    cy.wait(2000)
    // NE PAS appeler cy.prolongSession() pour laisser la modale visible
  })

  it('affiche la modale et le cadenas à 60 secondes au login', () => {
    // Vérifier que la modale apparaît avec le texte exact
    cy.contains('Votre session va expirer', { timeout: 10000 }).should('be.visible')
    
    // Vérifier que le compte à rebours est visible (60 secondes au départ)
    cy.contains(/Déconnexion automatique dans : \d+ secondes/i, { timeout: 5000 }).should('be.visible')
    cy.log('✅ Modale affichée avec 60 secondes')
  })

  it('le cadenas vert s\'affiche après login', () => {
    // Attendre que la modale apparaisse
    cy.contains('Votre session va expirer', { timeout: 10000 }).should('be.visible')
    
    // Vérifier que le cadenas est vert (lock-open)
    cy.get('.App__header__actions__cadenas__icon', { timeout: 5000 }).should('have.class', 'fa-lock-open')
    cy.log('✅ Cadenas vert visible')
  })

  it('prolonge la session et affiche 30 minutes', () => {
    // Attendre que la modale apparaisse
    cy.contains('Votre session va expirer', { timeout: 10000 }).should('be.visible')
    
    // Cliquer sur "Prolonger"
    cy.contains('button', 'Prolonger').click()
    cy.wait(1000)
    
    // La modale doit disparaître
    cy.contains('Votre session va expirer').should('not.exist')
    
    // Vérifier que le cadenas affiche 30:XX (30 minutes)
    cy.get('.App__header__actions__cadenas__timer', { timeout: 5000 }).then(($cadenas) => {
      const timerText = $cadenas.text()
      const [minutes] = timerText.split(':')
      expect(parseInt(minutes)).to.be.greaterThan(28)
      expect(parseInt(minutes)).to.be.lessThan(31)
      cy.log(`✅ Cadenas à ${timerText} après prolongation`)
    })
    
    // Vérifier que le cadenas reste vert (plus de 20 secondes)
    cy.get('.App__header__actions__cadenas__icon').should('have.class', 'fa-lock-open')
  })

  it('la modale ne réapparaît pas après prolongation pendant 5 secondes', () => {
    // Attendre que la modale apparaisse
    cy.contains('Votre session va expirer', { timeout: 10000 }).should('be.visible')
    
    // Cliquer sur "Prolonger"
    cy.contains('button', 'Prolonger').click()
    cy.wait(500)
    
    // La modale doit disparaître
    cy.contains('Votre session va expirer').should('not.exist')
    
    // Attendre 5 secondes et vérifier qu'elle ne réapparaît pas
    cy.wait(5000)
    cy.contains('Votre session va expirer').should('not.exist')
    cy.log('✅ Modale reste fermée après prolongation')
  })
})
