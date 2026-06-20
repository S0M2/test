class NavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
          <nav>
              <a href="#" class="logo">MOSA<span>IT</span></a>
              <input type="checkbox" id="nav-toggle" class="nav-toggle" />
              <label for="nav-toggle" class="nav-toggle-label">
                  <span></span>
              </label>
              <ul class="nav-links">
                  <li><a href="./index.html#services">Services</a></li>
                  <li><a href="./index.html#process">Processus</a></li>
                  <li><a href="./index.html#about">À propos</a></li>
                  <li><a href="./security.html">Sécurité</a></li>
                  <li><a href="./faq.html">FAQ</a></li>
                  <li><a href="./docs.html">Documentation</a></li>
                  <li><a href="./index.html#cta" class="nav-cta">Contactez-nous</a></li>
              </ul>
          </nav>
        `;
  }
}
customElements.define("nav-bar", NavBar);
