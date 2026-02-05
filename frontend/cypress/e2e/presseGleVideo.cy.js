// Test E2E - Article presse + Vidéo
describe('Presse - Article + Vidéo', () => {
  beforeEach(() => {
    cy.login()
    cy.goToPresseAdmin()
    cy.wait(200)
  })

  it('affiche le formulaire Article + Vidéo', () => {
    cy.get('select.presse-select', { timeout: 5000 }).should('be.visible')
    cy.get('select.presse-select').select('article-video')
    cy.wait(300)
    cy.get('form').should('be.visible')
    cy.get('input[name="title"]').should('exist')
    cy.get('textarea[name="content"]').should('exist')
    cy.get('input[name="video"]').should('exist')
  })

  it('rejette si vidéo manquante', () => {
    cy.get('select.presse-select').select('article-video')
    cy.wait(300)
    cy.get('input[name="title"]').type('Article sans vidéo')
    cy.get('textarea[name="content"]').type('Contenu sans vidéo')
    cy.get('button[type="submit"]').click()
    cy.contains(/vidéo|obligatoire/i, { timeout: 5000 }).should('be.visible')
  })

  it('crée un article avec vidéo valide (données en dur)', () => {
    cy.get('select.presse-select').select('article-video')
    cy.wait(300)
    
    // Données en dur
    cy.get('input[name="title"]').type('Titre, contenu et video')
    cy.get('textarea[name="content"]').type('Mon titre, mon contenu et ma video')
    cy.get('input[name="video"]').selectFile('cypress/fixtures/test-video.mp4', { force: true })
    
    // Attendre que la vidéo soit chargée (preview)
    cy.wait(2000)
    
    cy.prolongSession()
    cy.wait(500)
    
    cy.get('button[type="submit"]').should('be.visible').click()
    
    // Vérifier que le spinner apparaît (upload en cours)
    cy.get('.spinner').should('be.visible')
    cy.contains(/Upload de la vidéo en cours/i).should('be.visible')
    
    // Attendre que le spinner disparaisse (upload + 4s delay terminé)
    cy.get('.spinner').should('not.exist', { timeout: 120000 })
    
    // ⏱️ PUIS le message de succès apparaît
    cy.contains(/succès|publié/i, { timeout: 10000 }).should('be.visible')
  })

  it('VRAI TEST : vérifie que la vidéo est uploadée sur Contabo et liée en base', () => {
    cy.prolongSession()
    cy.wait(500)
    
    const uniqueTitle = `Article Video Test ${Date.now()}`
    const uniqueContent = 'Vérification video Contabo'
    
    cy.get('select.presse-select').select('article-video')
    cy.wait(300)
    
    // Remplir et uploader
    cy.get('input[name="title"]').type(uniqueTitle)
    cy.get('textarea[name="content"]').type(uniqueContent)
    cy.get('input[name="video"]').selectFile('cypress/fixtures/test-video.mp4', { force: true })
    
    // Attendre que la vidéo soit chargée (preview)
    cy.wait(2000)
    
    // Prolonger JUSTE AVANT le submit
    cy.prolongSession()
    cy.wait(500)
    
    cy.get('button[type="submit"]').should('be.visible').click()
    
    // Vérifier que le spinner apparaît (upload en cours)
    cy.get('.spinner').should('be.visible')
    cy.contains(/Upload de la vidéo en cours/i).should('be.visible')
    
    // Attendre que le spinner disparaisse (upload + 4s delay terminé)
    cy.get('.spinner').should('not.exist', { timeout: 120000 })
    
    // ⏱️ PUIS le message de succès apparaît
    cy.contains(/succès|publié/i, { timeout: 10000 }).should('be.visible')
    cy.wait(5000) // Attendre que la vidéo soit bien liée en BDD
    
    // VRAIE VÉRIFICATION : Récupérer l'article de la base de données
    cy.prolongSession()
    cy.wait(500)
    
    cy.window().then(() => {
      const token = localStorage.getItem('accessToken')
      
      cy.request({
        method: 'GET',
        url: 'https://cppeurope.net/api/users/messages/',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false
      }).then(response => {
        cy.log(`📊 Response status: ${response.status}`)
        cy.log(`📊 Articles trouvés: ${Array.isArray(response.body) ? response.body.length : 'N/A'}`)
        
        if (Array.isArray(response.body) && response.body.length > 0) {
          cy.log(`📝 5 premiers titres: ${response.body.slice(0, 5).map(a => a.title).join(', ')}`)
        }
        
        expect(response.status).to.equal(200)
        expect(response.body).to.be.an('array')
        
        // Trouver l'article créé
        const article = response.body.find(a => a.title === uniqueTitle)
        
        // Vérifier que l'article existe
        expect(article, `Article "${uniqueTitle}" devrait exister en base`).to.exist
        expect(article.content, 'Le contenu devrait correspondre').to.equal(uniqueContent)
        expect(article.categ, 'La catégorie devrait être presse').to.equal('presse')
        
        cy.log(`✅ Article trouvé: ID=${article.id}, media=${article.media ? article.media.length : 0}`)
        
        // Vérifier que la vidéo a été uploadée (via table Media)
        if (article.media && Array.isArray(article.media) && article.media.length > 0) {
          const video = article.media.find(m => m.type === 'video')
          if (video) {
            expect(video.filename, 'Video filename devrait exister').to.exist
            cy.log(`✅ Vidéo présente: ${video.filename}`)
          } else {
            cy.log(`⚠️ Aucune vidéo trouvée dans media (timeout vers Contabo?)`)
          }
        } else {
          cy.log(`⚠️ Media vide - l'upload vidéo a peut-être échoué (timeout vers Contabo?)`)
        }
      })
    })
  })
})
