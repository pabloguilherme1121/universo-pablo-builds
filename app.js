(() => {
  const heroImage = document.querySelector('.hero-visual img');
  const heroVisual = document.querySelector('.hero-visual');
  if (heroImage) {
    const hideFailedImage = () => {
      heroImage.hidden = true;
      if (heroVisual) heroVisual.hidden = true;
    };
    heroImage.addEventListener('error', hideFailedImage);
    if (heroImage.complete && heroImage.naturalWidth === 0) hideFailedImage();
  }
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-categories]')];
  const status = document.querySelector('#filter-status');
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let shown = 0;
    projects.forEach(project => {
      const visible = filter === 'todos' || project.dataset.categories.split(' ').includes(filter);
      project.hidden = !visible;
      if (visible) shown++;
    });
    status.textContent = `${shown} ${shown === 1 ? 'projeto encontrado' : 'projetos encontrados'}.`;
  }));
})();
