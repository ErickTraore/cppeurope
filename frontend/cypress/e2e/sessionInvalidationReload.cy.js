/**
 * Test E2E Cypress : invalidation de session au rechargement
 * À chaque réinitialisation de l’URL (rechargement), l’app remet le timer à zéro et déconnecte :
 * toute session active devient inactive après un F5.
 */
describe('invalidation de session au rechargement', () => {
  const loginEmail = 'admin2026@cppeurope.net';
  const loginPassword = 'admin2026!';

  it('après connexion, un rechargement de la page déconnecte et affiche à nouveau le formulaire de connexion', () => {
    cy.visit('/');

    // État initial : non authentifié
    cy.get('div.App.not-authenticated').should('exist');
    cy.get('.auth-container').should('exist');
    cy.get('.auth-title').should('contain', 'Je me connecte');

    // Connexion
    cy.get('input[type="email"][placeholder="Email"]').clear().type(loginEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(loginPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();

    // Attendre l’état authentifié (timer/cadenas visible dans le header)
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('.App__header__actions__cadenas').should('exist');

    // Rechargement de la page = réinitialisation URL
    cy.reload();

    // La session doit être invalidée : retour à l’état non authentifié, formulaire de connexion
    cy.get('div.App.not-authenticated').should('exist');
    cy.get('.auth-container').should('exist');
    cy.get('.auth-title').should('contain', 'Je me connecte');
    cy.get('form.login-form').should('exist');
    // Le timer/cadenas ne doit pas être présent (SessionManager non monté)
    cy.get('.App__header__actions__cadenas').should('not.exist');
  });
});
