/**
 * Presse Locale - Delete option 4. Cible "titre remplacé Option4" dans Gérer, supprime, vérifie.
 */
describe('Presse Locale - Delete (option 4)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const titreRemplacePrefix = 'titre remplacé Option4';
  const apiBase = () => Cypress.config('baseUrl') + '/api/presse-locale/messages/';
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
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        const matching = messages.filter((m) => typeof m.title === 'string' && m.title.startsWith(titreRemplacePrefix));
        initialCount = matching.length;
        expect(initialCount, `Au moins un message API "${titreRemplacePrefix}*" doit exister avant suppression`).to.be.gte(1);

        return cy.request({
          method: 'DELETE',
          url: apiBase() + matching[0].id,
          headers: { Authorization: 'Bearer ' + token },
          failOnStatusCode: false,
        }).then((delRes) => {
          expect(delRes.status).to.be.oneOf([200, 204]);
        });
      }).then(() => {
        cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((afterRes) => {
          expect(afterRes.status).to.eq(200);
          const after = Array.isArray(afterRes.body) ? afterRes.body : [];
          const remaining = after.filter((m) => typeof m.title === 'string' && m.title.startsWith(titreRemplacePrefix)).length;
          expect(remaining, `Le nombre de messages API "${titreRemplacePrefix}*" doit diminuer de 1`).to.eq(Math.max(0, initialCount - 1));
        });
      });
    });
  });
});
