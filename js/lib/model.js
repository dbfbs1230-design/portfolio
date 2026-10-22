// Pure helpers shared by the UI and regression checks.
export const languages = ['en', 'ko'];
export function text(value, language = 'en') {
  return value?.[language] ?? value?.en ?? '';
}
export function filterProjects(projects, category) {
  return category === 'all' ? projects : projects.filter(project => project.category === category);
}
export function readState(search, projects, categoryIds, fallbackLanguage = 'en') {
  const params = new URLSearchParams(search);
  const requestedLanguage = params.get('lang');
  const language = languages.includes(requestedLanguage)
    ? requestedLanguage : languages.includes(fallbackLanguage) ? fallbackLanguage : 'en';
  let category = categoryIds.includes(params.get('category')) ? params.get('category') : 'all';
  const project = projects.find(item => item.id === params.get('project')) ?? null;
  // A project deep link should always have a visible source card.
  if (project && category !== 'all' && project.category !== category) category = project.category;
  return { language, category, projectId: project?.id ?? null };
}
export function validateProjects(projects, categoryIds) {
  const ids = new Set();
  for (const project of projects) {
    if (!/^[a-z][a-z0-9-]*$/.test(project.id) || ids.has(project.id)) throw new Error(`Invalid/duplicate project ID: ${project.id}`);
    ids.add(project.id);
    if (!categoryIds.includes(project.category) || project.category === 'all') throw new Error(`Invalid category: ${project.id}`);
    for (const field of ['title', 'discipline', 'summary', 'role', 'process']) {
      for (const language of languages) {
        if (typeof project[field]?.[language] !== 'string' || !project[field][language].trim()) throw new Error(`Missing ${field}.${language}: ${project.id}`);
      }
    }
    if (typeof project.demo !== 'boolean') throw new Error(`Missing demo flag: ${project.id}`);
    if (!Array.isArray(project.images) || !project.images.length) throw new Error(`Missing images: ${project.id}`);
    for (const image of project.images) {
      if (typeof image.src !== 'string' || !/^(\.\/assets\/images\/|https:\/\/)/.test(image.src)) throw new Error(`Invalid image path: ${project.id}`);
      for (const language of languages) if (!image.alt?.[language]) throw new Error(`Missing alt.${language}: ${project.id}`);
    }
  }
  return true;
}

export function stateURL(href, state) {
  const url = new URL(href);
  url.searchParams.set('lang', state.language);
  if (state.category !== 'all') url.searchParams.set('category', state.category);
  else url.searchParams.delete('category');
  if (state.projectId) url.searchParams.set('project', state.projectId);
  else url.searchParams.delete('project');
  return url;
}
