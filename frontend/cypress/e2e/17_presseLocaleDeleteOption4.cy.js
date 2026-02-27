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
    let initialCount = 0;
    cy.window().then((win) => { win.location.hash = 'presse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('.message-card', { timeout: 15000 }).then(($cards) => {
      initialCount = $cards.filter((_, el) => Cypress.$(el).find('h3').text().trim() === titreRemplace).length;
      expect(initialCount, 'Au moins une carte "titre remplacé Option4" doit exister avant suppression').to.be.gte(1);
    });
    cy.get('.message-card', { timeout: 15000 }).filter((_, el) => Cypress.$(el).find('h3').text().trim() === titreRemplace).first().within(() => {
      cy.window().then((win) => { cy.stub(win, 'confirm').returns(true); cy.stub(win, 'alert'); });
      cy.get('button.btn-delete').contains('Supprimer').click();
    });
    cy.get('body', { timeout: 10000 }).should(($body) => {
      const withTitle = $body.find('.message-card').filter((_, el) => Cypress.$(el).find('h3').text().trim() === titreRemplace);
      expect(withTitle.length, 'Le nombre de cartes "titre remplacé Option4" doit diminuer de 1').to.eq(Math.max(0, initialCount - 1));
    });
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        const remaining = messages.filter((m) => m.title === titreRemplace).length;
        expect(remaining, 'Le nombre de messages API "titre remplacé Option4" doit diminuer de 1').to.eq(Math.max(0, initialCount - 1));
      });
    });
  });
});
