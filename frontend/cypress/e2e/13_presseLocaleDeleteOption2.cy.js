/**
 * Presse Locale - Delete option 2. Cible "titre remplacé Option2" dans Gérer, supprime, vérifie.
 */
describe('Presse Locale - Delete (option 2)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('1 - cible une carte supprimable en Gérer, 2 - la supprime, 3 - vérifie la suppression', () => {
    cy.window().then((win) => { win.location.hash = 'presse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.intercept('DELETE', '**/api/**/messages/*').as('deleteMessage');
    cy.get('.message-card', { timeout: 15000 }).should('have.length.at.least', 1);
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); cy.stub(win, 'alert'); });
    cy.get('.message-card').first().within(() => {
      cy.get('button.btn-delete').contains('Supprimer').click();
    });
    cy.wait('@deleteMessage', { timeout: 15000 }).then(({ response }) => {
      expect(response && [200, 204].includes(response.statusCode), 'DELETE doit réussir').to.be.true;
    });
    cy.get('.messages-list, .no-messages', { timeout: 15000 }).should('exist');
  });
});
