/**
 * Presse Locale - Create option 1 (titre + contenu).
 * Flux : création → vérif API → Consulter → modification via API + vérif Gérer.
 */
describe('Presse Locale - Create (option 1: titre + contenu)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const contenu = 'E2E Contenu article presse locale.';
  const titreRemplace = 'titre remplacé';
  const contenuRemplace = "Votre texte a été remplacé pour des raisons d'optimisation.";
  const apiBase = () => Cypress.config('baseUrl') + '/api/presse-locale/messages/';
  const apiMessages = () => apiBase() + '?categ=presse-locale&siteKey=cppEurope';
  let titre;
  let createdMessage;
  before(() => { titre = 'E2E Titre Presse Locale ' + Date.now(); });
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('envoie article et affiche succès', () => {
    cy.intercept('POST', '**/api/**/messages/new*').as('postMessageNew');
    cy.window().then((win) => { win.location.hash = 'admin-presse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('#format').select('article');
    cy.get('input[name="title"]').clear().type(titre);
    cy.get('textarea[name="content"]').clear().type(contenu);
    cy.get('input[name="title"]').closest('form').within(() => {
      cy.root().submit();
    });
    cy.wait('@postMessageNew', { timeout: 30000 }).then(({ request, response }) => {
      expect(request.url).to.match(/\/api\/.+\/messages\/new\/?/);
      if (!response || ![200, 201].includes(response.statusCode)) {
        throw new Error(`POST /messages/new failed: status=${response?.statusCode}, body=${JSON.stringify(response?.body)}`);
      }
    });
    cy.contains('Article publié avec succès', { timeout: 15000 }).should('be.visible');
  });
  it('vérifie en BDD via API messages et garde le message pour Gérer', () => {
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        const found = messages.find((m) => m.title === titre);
        expect(found, 'message créé trouvé via API').to.exist;
        createdMessage = found;
      });
    });
  });
  it('en Consulter : page, titre et contenu consultables', () => {
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        expect(messages.some((m) => m.title === titre), 'message visible via API avant vérification UI').to.be.true;
      });
    });
    cy.window().then((win) => { win.location.hash = 'newpresse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('.presse__container__title').should('contain', 'Presse Locale');
    cy.get('.presse__container__messagelist').should('exist');
    cy.get('.presse__message--text-only', { timeout: 25000 }).should('have.length.at.least', 1).first().within(() => {
      cy.get('.presse__message__header').click();
      cy.get('.presse__message__content').should('be.visible').invoke('text').should('match', /\S+/);
    });
  });
  it('remplace le titre et le contenu via API et vérifie en Gérer', () => {
    expect(createdMessage, 'createdMessage défini par test précédent').to.exist;
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'PUT',
        url: apiBase() + createdMessage.id,
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: { title: titreRemplace, content: contenuRemplace },
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200);
        cy.window().then((win) => { win.location.hash = 'presse-locale'; });
        cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
        cy.contains('.message-card', titreRemplace, { timeout: 15000 }).within(() => {
          cy.get('.message-content').should('contain', contenuRemplace);
        });
      });
    });
  });
});
