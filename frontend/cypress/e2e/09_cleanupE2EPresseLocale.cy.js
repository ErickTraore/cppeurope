/**
 * Test 09 - Nettoyage E2E Presse Locale.
 * Recherche en BDD les 4 enregistrements créés par les specs create-1 à create-4
 * et les supprime via l'API presse locale. Ne supprime jamais de contenu utilisateur.
 */
const E2E_TITLES_ONLY = [
  'titre remplacé',
  'titre remplacé Option2',
  'titre remplacé Option3',
  'titre remplacé Option4',
];

describe('09 - Cleanup E2E Presse Locale', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const apiList = () =>
    Cypress.config('baseUrl') + '/api/presse-locale/messages/?categ=presse-locale&siteKey=cppEurope';
  const apiDelete = (id) => Cypress.config('baseUrl') + '/api/presse-locale/messages/' + id;

  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });

  it('récupère les messages presse locale puis supprime uniquement les 4 enregistrements E2E', () => {
    const runVerification = () => {
      cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
        cy.request({
          method: 'GET',
          url: apiList(),
          headers: { Authorization: 'Bearer ' + token },
        }).then((res) => {
          expect(res.status).to.eq(200);
          const messages = Array.isArray(res.body) ? res.body : [];
          const remainingE2E = messages.filter((m) => m.title && E2E_TITLES_ONLY.includes(m.title.trim()));
          expect(remainingE2E, 'Les 4 enregistrements E2E ne doivent plus exister en BDD').to.have.length(0);
        });
      });
    };

    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'GET',
        url: apiList(),
        headers: { Authorization: 'Bearer ' + token },
      }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        const toDelete = messages.filter((m) => m.title && E2E_TITLES_ONLY.includes(m.title.trim()));
        expect(toDelete.length).to.be.at.most(4, 'Seuls au plus 4 enregistrements E2E peuvent exister');

        if (toDelete.length > 0) {
          cy.wrap(toDelete).each((msg) => {
            cy.request({
              method: 'DELETE',
              url: apiDelete(msg.id),
              headers: { Authorization: 'Bearer ' + token },
              failOnStatusCode: false,
            }).then((delRes) => {
              expect(delRes.status).to.be.oneOf([200, 204], `Suppression du message "${msg.title}" (id=${msg.id})`);
            });
          });
          cy.log(`Supprimé ${toDelete.length} enregistrement(s) E2E: ${toDelete.map((m) => m.title).join(', ')}`);
          cy.then(() => runVerification());
        } else {
          cy.log('Aucun enregistrement E2E à supprimer.');
          runVerification();
        }
      });
    });
  });
});
