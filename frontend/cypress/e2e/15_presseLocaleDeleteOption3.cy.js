/**
 * Presse Locale - Delete option 3. Cible "titre remplacé Option3" dans Gérer, supprime, vérifie.
 */
describe('Presse Locale - Delete (option 3)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const titreRemplace = 'titre remplacé Option3';
  const apiMessages = () => Cypress.config('baseUrl') + '/api/presse-locale/messages/?categ=presse-locale&siteKey=cppEurope';
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('1 - cible la carte titre remplacé Option3 dans Gérer, 2 - la supprime, 3 - vérifie la suppression', () => {
    cy.visit('/#presse-locale');
    cy.contains('.message-card', titreRemplace, { timeout: 10000 }).should('be.visible').and('exist');
    cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); cy.stub(win, 'alert'); });
    cy.contains('.message-card', titreRemplace).within(() => {
      cy.get('button.btn-delete').contains('Supprimer').click();
    });
    cy.contains('.message-card', titreRemplace).should('not.exist');
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        expect(messages.some((m) => m.title === titreRemplace)).to.be.false;
      });
    });
  });
});
