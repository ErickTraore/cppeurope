/**
 * Test E2E Cypress : invalidation de session au rechargement
 * Après un rechargement, l'utilisateur revient à l'écran de connexion.
 */
describe('invalidation de session au rechargement', () => {
  const loginEmail = 'admin2026@cppeurope.net';
  const loginPassword = 'admin2026!';

  it('après connexion, un rechargement déconnecte et réaffiche les champs de connexion', () => {
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

    // Rechargement de la page
    cy.reload();

    // La session doit être invalidée
    cy.get('div.App.not-authenticated', { timeout: 15000 }).should('exist');
    cy.get('div.App.authenticated').should('not.exist');
    cy.get('.App__header__actions__cadenas').should('not.exist');
  });
});
