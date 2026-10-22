import { projects } from './data/projects.js';
import { categories, copy, profile } from './data/site.js';
import { text, filterProjects, readState, stateURL, validateProjects } from './lib/model.js';

const $ = id => document.getElementById(id);
const categoryIds = categories.map(item => item.id);
validateProjects(projects, categoryIds);
let storedLanguage = 'en';
try { storedLanguage = localStorage.getItem('sy-portfolio.language') || 'en'; } catch { /* Storage may be unavailable. */ }
let state = readState(location.search, projects, categoryIds, storedLanguage);
let returnProjectId = null;
let menuOpen = false;
const dialog = $('projectDialog');
const t = key => copy[state.language][key] ?? copy.en[key] ?? key;
const local = value => text(value, state.language);
const selectedProjects = () => filterProjects(projects, state.category);

function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}
function syncURL() {
  // Keep filters, detail links and locale derived from the same state.
  history.replaceState(null, '', stateURL(location.href, state));
}
function applyCopy() {
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-alt-i18n]').forEach(node => { node.alt = t(node.dataset.altI18n); });
  for (const button of [$('language'), $('detailLanguage')]) {
    button.textContent = state.language === 'en' ? 'KO' : 'EN';
    button.setAttribute('aria-label', state.language === 'en' ? '한국어로 보기' : 'Read in English');
  }
  $('menu').setAttribute('aria-label', t(menuOpen ? 'closeMenu' : 'openMenu'));
  $('filters').setAttribute('aria-label', t('categoryLabel'));
  $('navigation').setAttribute('aria-label', t('navLabel'));
  $('closeDialog').setAttribute('aria-label', t('close'));
}
function imageNode(image, eager = false) {
  const img = element('img', 'project-art');
  img.src = image.src;
  img.alt = local(image.alt);
  img.width = 800; img.height = 640;
  img.loading = eager ? 'eager' : 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => { img.src = './assets/images/fallback.svg'; img.alt = t('imageFallback'); }, { once: true });
  return img;
}
function renderFilters() {
  const fragment = document.createDocumentFragment();
  for (const category of categories) {
    const count = filterProjects(projects, category.id).length;
    const button = element('button', 'filter', `${local(category)} (${count})`);
    button.type = 'button'; button.dataset.filter = category.id;
    button.setAttribute('aria-pressed', String(state.category === category.id));
    button.setAttribute('aria-controls', 'projects');
    fragment.append(button);
  }
  $('filters').replaceChildren(fragment);
}
function renderProjects() {
  const visible = selectedProjects();
  const fragment = document.createDocumentFragment();
  visible.forEach((project, index) => {
    const article = element('article', 'project');
    const button = element('a', 'project-link');
    button.href = stateURL(location.href, { ...state, projectId: project.id }).href;
    button.dataset.project = project.id;
    button.setAttribute('aria-label', t('openProject').replace('{title}', local(project.title)));
    button.setAttribute('aria-haspopup', 'dialog');
    const visual = element('div', 'project-visual');
    visual.append(imageNode(project.images[0], index < 2));
    if (project.demo) visual.append(element('span', 'demo-tag', t('demo')));
    visual.append(element('span', 'project-num', `${String(index + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`));
    const meta = element('div', 'project-meta');
    const title = element('div');
    title.append(element('h3', 'project-title', local(project.title)), element('p', 'project-type', local(project.discipline)));
    meta.append(title, element('span', 'project-year', project.year ?? t('undated')));
    button.append(visual, meta); article.append(button); fragment.append(article);
  });
  $('projects').replaceChildren(fragment);
  $('workCount').textContent = `(${String(visible.length).padStart(2, '0')})`;
  $('resultsStatus').textContent = t('results').replace('{count}', visible.length);
}
function renderProfile() {
  $('profile').replaceChildren(...profile.map(item => {
    const article = element('article', 'cv-card');
    const list = element('ul');
    item.items.forEach(line => list.append(element('li', '', local(line))));
    article.append(element('h3', '', local(item.title)), list);
    return article;
  }));
}
function renderDetail() {
  const project = projects.find(item => item.id === state.projectId);
  if (!project) return;
  $('detailTitle').textContent = local(project.title);
  $('detailSummary').textContent = local(project.summary);
  $('detailMeta').textContent = `${local(categories.find(item => item.id === project.category))} / ${local(project.discipline)}`;
  $('detailRole').textContent = local(project.role);
  $('detailProcess').textContent = local(project.process);
  $('detailDemo').hidden = !project.demo;
  $('detailGallery').replaceChildren(...project.images.map((image, index) => {
    const figure = element('figure');
    figure.append(imageNode(image, index === 0), element('figcaption', '', local(image.alt)));
    return figure;
  }));
  const visible = selectedProjects();
  const index = visible.findIndex(item => item.id === state.projectId);
  $('detailCount').textContent = `${String(index + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
  $('previous').disabled = index <= 0;
  $('next').disabled = index >= visible.length - 1;
}
function openProject(id) {
  if (!projects.some(item => item.id === id)) return;
  returnProjectId = id;
  state.projectId = id;
  renderDetail(); syncURL();
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.scrollTop = 0;
}
function setLanguage() {
  state.language = state.language === 'en' ? 'ko' : 'en';
  try { localStorage.setItem('sy-portfolio.language', state.language); } catch { /* Nonessential preference. */ }
  render(); syncURL();
}
function setMenu(open) {
  menuOpen = open;
  $('navigation').classList.toggle('is-open', open);
  $('menu').setAttribute('aria-expanded', String(open));
  $('menu').setAttribute('aria-label', t(open ? 'closeMenu' : 'openMenu'));
  $('menu').firstElementChild.textContent = open ? '×' : '☰';
}
function render() {
  applyCopy(); renderFilters(); renderProjects(); renderProfile();
  if (state.projectId) renderDetail();
}

// Delegated listeners are registered once; re-rendering never duplicates handlers.
$('filters').addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  state.category = button.dataset.filter;
  renderFilters(); renderProjects(); syncURL();
  document.querySelector(`[data-filter="${state.category}"]`).focus({ preventScroll: true });
});
$('projects').addEventListener('click', event => {
  const button = event.target.closest('a[data-project]');
  if (!button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  openProject(button.dataset.project);
});
$('language').addEventListener('click', setLanguage);
$('detailLanguage').addEventListener('click', setLanguage);
$('menu').addEventListener('click', () => setMenu(!menuOpen));
$('navigation').addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('click', event => { if (menuOpen && !event.target.closest('.topbar')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuOpen) { setMenu(false); $('menu').focus(); }
});
matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
$('closeDialog').addEventListener('click', () => dialog.close());
// Only a pointer gesture beginning and ending on the backdrop dismisses the dialog.
let backdropStart = false;
dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog && isOutside(event); });
dialog.addEventListener('click', event => { if (backdropStart && event.target === dialog && isOutside(event)) dialog.close(); backdropStart = false; });
function isOutside(event) {
  const r = dialog.getBoundingClientRect();
  return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
}
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  state.projectId = null; syncURL();
  if (returnProjectId) document.querySelector(`[data-project="${returnProjectId}"]`)?.focus({ preventScroll: true });
});
for (const [id, direction] of [['previous', -1], ['next', 1]]) {
  $(id).addEventListener('click', () => {
    const visible = selectedProjects();
    const index = visible.findIndex(item => item.id === state.projectId);
    const next = visible[index + direction];
    if (next) { state.projectId = next.id; renderDetail(); syncURL(); dialog.scrollTop = 0; $('closeDialog').focus({ preventScroll: true }); }
  });
}
window.addEventListener('popstate', () => {
  const nextState = readState(location.search, projects, categoryIds, state.language);
  // close() emits an asynchronous event. Clear the old dialog before applying a new deep link.
  if (dialog.open && !nextState.projectId) dialog.close();
  state = nextState; render();
  if (state.projectId) openProject(state.projectId);
});
$('year').textContent = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Seoul' }).format(new Date());
render();
if (state.projectId) openProject(state.projectId);
