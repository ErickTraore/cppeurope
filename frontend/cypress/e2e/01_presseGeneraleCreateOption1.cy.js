/**
 * Presse Générale - Create option 1 (titre + contenu).
 * 
 * Flux : création → vérif API (message conservé pour Gérer) → Consulter → modification via API + vérif Gérer.
 * Snapshot BDD supprimé ; vérification via API messages uniquement.
 */
describe('Presse Générale - Create (option 1: titre + contenu)', () => {
  const adminEmail = 'admin2026@cppeurope.net';
  const adminPassword = 'admin2026!';
  const contenu = 'E2E Contenu article presse générale.';
  const titreRemplace = 'titre remplacé';
  const contenuRemplace = "Votre texte a été remplacé pour des raisons d'optimisation.";
  const apiMessages = () => Cypress.config('baseUrl') + '/api/users/messages/';
  // option1
  let titre;
  let createdMessage;

  before(() => {
    titre = 'E2E Titre Presse ' + Date.now();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
  });

  it('envoie article et affiche succès', () => {
    cy.visit('/#admin-presse-generale');
    cy.get('#format').select('article');
    cy.get('input[name="title"]').clear().type(titre);
    cy.get('textarea[name="content"]').clear().type(contenu);
    cy.get('form').submit();
    cy.contains('Article publié avec succès', { timeout: 15000 }).should('be.visible');
  });

  it('vérifie en BDD via API messages et garde le message pour Gérer', () => {
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'GET',
        url: apiMessages(),
        headers: { Authorization: 'Bearer ' + token },
      }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        const found = messages.find((m) => m.title === titre);
        expect(found, 'message créé trouvé via API').to.exist;
        createdMessage = found;
      });
    });
  });

  it('en Consulter : page, titre et contenu consultables', () => {
    cy.visit('/#newpresse');
    cy.get('.presse__container__title').should('contain', 'Presse PPA-CI');
    cy.get('.presse__container__messagelist').should('exist');
    cy.contains('.presse__message__header__title', titre, { timeout: 10000 }).should('be.visible');
    cy.contains('.presse__message__header__title', titre)
      .parents('.presse__message--text-only')
      .first()
      .within(() => {
        cy.get('.presse__message__header').click();
        cy.get('.presse__message__content').should('be.visible').and('contain', contenu);
      });
  });

  it('remplace le titre et le contenu via API et vérifie en Gérer', () => {
    expect(createdMessage, 'createdMessage défini par test précédent').to.exist;
    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'PUT',
        url: apiMessages() + createdMessage.id,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: {
          ...createdMessage,
          title: titreRemplace,
          content: contenuRemplace,
        },
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200);
        cy.visit('/#presse-generale');
        cy.contains('.message-card', titreRemplace, { timeout: 15000 }).within(() => {
          cy.get('.message-content').should('contain', contenuRemplace);
        });
      });
    });
  });
});
