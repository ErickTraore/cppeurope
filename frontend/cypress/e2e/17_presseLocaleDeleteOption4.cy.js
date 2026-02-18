/**
 * Presse Locale - Delete option 4. Cible "titre remplacé Option4" dans Gérer, supprime, vérifie.
 */
describe('Presse Locale - Delete (option 4)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const titreRemplace = 'titre remplacé Option4';
  const apiMessages = () => Cypress.config('baseUrl') + '/api/presse-locale/messages/?categ=presse-locale&siteKey=cppEurope';
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('1 - cible la carte titre remplacé Option4 dans Gérer, 2 - la supprime, 3 - vérifie la suppression', () => {
    cy.visit('/#presse-locale');
    cy.get('.message-card', { timeout: 15000 }).filter((_, el) => Cypress.$(el).find('h3').text().trim() === titreRemplace).should('have.length.at.least', 1).first().within(() => {
      cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); cy.stub(win, 'alert'); });
      cy.get('button.btn-delete').contains('Supprimer').click();
    });
    cy.get('body', { timeout: 10000 }).should(($body) => {
      const withTitle = $body.find('.message-card').filter((_, el) => Cypress.$(el).find('h3').text().trim() === titreRemplace);
      expect(withTitle.length, 'aucune carte "titre remplacé Option4"').to.eq(0);
    });
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        expect(messages.some((m) => m.title === titreRemplace)).to.be.false;
      });
    });
  });
});
