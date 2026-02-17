/**
 * Presse Locale - Delete option 1. Cible "titre remplacé" (créé par option-1) dans Gérer, supprime, vérifie.
 */
describe('Presse Locale - Delete (option 1)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const titreRemplace = 'titre remplacé';
  const apiMessages = () => Cypress.config('baseUrl') + '/api/presse-locale/messages/?categ=presse-locale&siteKey=cppEurope';
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('1 - cible la carte titre remplacé dans Gérer, 2 - la supprime, 3 - vérifie la suppression', () => {
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); cy.stub(win, 'alert'); });
    cy.intercept('DELETE', '**/api/presse-locale/messages/*').as('deleteMsg');
    cy.visit('/#presse-locale');
    // Table vidée avant le run : une seule carte "titre remplacé" (h3 exact)
    cy.get('.message-card', { timeout: 10000 }).filter((_, el) => Cypress.$(el).find('h3').text().trim() === titreRemplace).should('have.length', 1).first().within(() => {
      cy.get('button.btn-delete').contains('Supprimer').click();
    });
    cy.wait('@deleteMsg', { timeout: 10000 });
    cy.get('.message-card').filter((_, el) => Cypress.$(el).find('h3').text().trim() === titreRemplace).should('not.exist', { timeout: 12000 });
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        expect(messages.some((m) => m.title === titreRemplace)).to.be.false;
      });
    });
  });
});
