// Test E2E - Article presse (texte uniquement)
// ⚠️ IMPORTANT : Les tests doivent TERMINER en moins de 60 secondes avant que la modale apparaisse !
describe('Presse - Article uniquement', () => {
  beforeEach(() => {
    cy.login()
    cy.goToPresseAdmin()
    // Ne pas prolongSession() ici - elle est déjà appelée dans goToPresseAdmin()
    cy.wait(200)
  })

  it('affiche le formulaire Article', () => {
    cy.get('select.presse-select', { timeout: 5000 }).should('be.visible')
    cy.get('select.presse-select').select('article')
    cy.wait(100)
    cy.get('form').should('be.visible')
    cy.get('input[name="title"]').should('exist')
    cy.get('textarea[name="content"]').should('exist')
  })

  it('rejette si titre vide', () => {
    cy.get('select.presse-select').select('article')
    cy.wait(100)
    // Retirer l'attribut required pour tester la validation JavaScript
    cy.get('input[name="title"]').invoke('removeAttr', 'required')
    cy.get('textarea[name="content"]').type('Contenu de test')
    cy.get('button[type="submit"]').click()
    cy.contains(/titre|obligatoire/i).should('be.visible')
  })

  it('rejette si contenu vide', () => {
    cy.get('select.presse-select').select('article')
    cy.wait(100)
    cy.get('input[name="title"]').type('Titre de test')
    // Retirer l'attribut required pour tester la validation JavaScript
    cy.get('textarea[name="content"]').invoke('removeAttr', 'required')
    cy.get('button[type="submit"]').click()
    cy.contains(/contenu|obligatoire/i).should('be.visible')
  })

  it('crée un article avec titre et contenu valides', () => {
    cy.get('select.presse-select').select('article')
    cy.wait(100)
    cy.get('input[name="title"]').type('Article E2E Test')
    cy.get('textarea[name="content"]').type('Contenu du test d\'article')
    cy.get('button[type="submit"]').click()
    cy.contains(/succès|publié/i, { timeout: 15000 }).should('be.visible')
  })

  it('réinitialise les champs après soumission', () => {
    cy.get('select.presse-select').select('article')
    cy.wait(100)
    cy.get('input[name="title"]').type('Titre')
    cy.get('textarea[name="content"]').type('Contenu')
    cy.get('button[type="submit"]').click()
    cy.wait(1000)
    cy.get('input[name="title"]').should('have.value', '')
    cy.get('textarea[name="content"]').should('have.value', '')
  })

  it('crée un article avec données en dur', () => {
    cy.get('select.presse-select').select('article')
    cy.wait(100)
    
    // Données en dur
    cy.get('input[name="title"]').type('titre un en dure')
    cy.get('textarea[name="content"]').type('test un en dure')
    
    cy.prolongSession()
    cy.wait(500)
    
    cy.get('button[type="submit"]').click()
    cy.contains(/succès|publié/i, { timeout: 15000 }).should('be.visible')
  })

  it('VRAI TEST : vérifie que l\'article est bien créé en base de données', () => {
    // Prolonger IMMÉDIATEMENT avant que le token expire (1 min après login)
    cy.prolongSession()
    cy.wait(500)
    
    cy.get('select.presse-select').select('article')
    cy.wait(100)
    
    const uniqueTitle = `Article Test BDD ${Date.now()}`
    const uniqueContent = `Contenu test validation base de données ${Date.now()}`
    
    // Créer l'article
    cy.get('input[name="title"]').type(uniqueTitle)
    cy.get('textarea[name="content"]').type(uniqueContent)
    
    cy.get('button[type="submit"]').click()
    cy.contains(/succès|publié/i, { timeout: 15000 }).should('be.visible')
    
    cy.wait(2000)
    
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
        
        if (response.status !== 200) {
          throw new Error(`GET /users/messages/ returned ${response.status}: ${JSON.stringify(response.body)}`)
        }
        
        expect(response.body).to.be.an('array')
        
        // Trouver l'article créé
        const article = response.body.find(a => a.title === uniqueTitle)
        
        // Vérifier que l'article existe
        expect(article, `Article "${uniqueTitle}" devrait exister en base`).to.exist
        expect(article.content, 'Le contenu devrait correspondre').to.equal(uniqueContent)
        expect(article.categ, 'La catégorie devrait être presse').to.equal('presse')
        
        cy.log(`✅ Article trouvé en base: ID=${article.id}, title="${article.title}"`)
      })
    })
  })
})
