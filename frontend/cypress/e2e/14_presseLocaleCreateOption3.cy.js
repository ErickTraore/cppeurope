/**
 * Presse Locale - Create option 3 (titre + contenu + vidéo).
 * Même rigueur que option-1 : API, Consulter (page + titre + vidéo + contenu), Gérer via API.
 */
describe('Presse Locale - Create (option 3: titre + contenu + vidéo)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const contenu = 'E2E Contenu article avec vidéo (fixture video-1).';
  const titreRemplace = `titre remplacé Option3 ${Date.now()}`;
  const contenuRemplace = "Votre texte a été remplacé pour des raisons d'optimisation.";
  const apiBase = () => Cypress.config('baseUrl') + '/api/presse-locale/messages/';
  const apiMessages = () => apiBase() + '?categ=presse-locale&siteKey=cppEurope';
  const videoFixture = 'cypress/fixtures/videos/video-1.mp4';
  const videoFixture2 = 'cypress/fixtures/videos/video-2.mp4';
  const waitForUpdatedTitle = (token, expectedTitle, remaining = 12) => {
    return cy.request({ method: 'GET', url: apiMessages(), headers: { Authorization: 'Bearer ' + token } }).then((res) => {
      expect(res.status).to.eq(200);
      const messages = Array.isArray(res.body) ? res.body : [];
      const found = messages.some((m) => m.title === expectedTitle);
      if (found) return;
      if (remaining <= 1) {
        throw new Error(`Titre mis à jour introuvable via API: ${expectedTitle}`);
      }
      return cy.wait(500).then(() => waitForUpdatedTitle(token, expectedTitle, remaining - 1));
    });
  };
  const ensureAuthenticated = () => {
    cy.get('body').then(($body) => {
      if ($body.find('input[type="email"][placeholder="Email"]').length) {
        cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
        cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
        cy.get('button.auth-submit').contains('Se connecter').click();
      }
    });
    cy.get('div.App.authenticated', { timeout: 60000 }).should('exist');
  };
  let titre;
  let createdMessage;
  before(() => { titre = 'E2E Option3 Presse Locale ' + Date.now(); });
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });
  it('envoie article avec titre, contenu et vidéo et affiche succès', () => {
    cy.window().then((win) => { win.location.hash = 'admin-presse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('#format').select('article-video');
    cy.get('input[name="title"]').clear().type(titre);
    cy.get('textarea[name="content"]').clear().type(contenu);
    cy.get('input[type="file"][name="video"]').selectFile(videoFixture, { force: true });
    cy.get('button[type="submit"]').contains('Publier').click();
    cy.contains('Article publié avec succès', { timeout: 90000 }).should('be.visible');
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
  it('en Consulter : page, titre, vidéo et contenu consultables', () => {
    cy.window().then((win) => { win.location.hash = 'newpresse-locale'; });
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('.presse__container__title').should('contain', 'Presse Locale');
    cy.get('.presse__container__messagelist').should('exist');
    cy.contains('.presse__message__header__title', titre, { timeout: 10000 }).should('be.visible');
    cy.contains('.presse__message__header__title', titre).parents('.presse__message--video-only').first().within(() => {
      cy.get('.presse__message__media__videoWrapper').should('be.visible');
      cy.get('.presse__message__textbar').click();
      cy.get('.presse__message__content').should('be.visible').and('contain', contenu);
    });
  });
  it('met à jour le titre/contenu via API et valide l\'accès à Gérer sans régression', () => {
    expect(createdMessage, 'createdMessage défini par test précédent').to.exist;
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'PUT',
        url: apiBase() + createdMessage.id,
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: { title: titreRemplace, content: contenuRemplace },
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200);
        return waitForUpdatedTitle(token, titreRemplace).then(() => {
          cy.visit('/#presse-locale');
          ensureAuthenticated();
          cy.window().then((win) => { win.location.hash = 'presse-locale'; });
          cy.contains('h1.admin-title', 'GESTION PRESSE LOCALE', { timeout: 15000 }).should('be.visible');
          cy.get('.messages-list, .no-messages', { timeout: 15000 }).should('exist');
        });
      });
    });
  });
});
