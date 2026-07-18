export default async function sitemap() {
  const routes = [''].map((route) => ({
    url: `https://ptcgp.miraklasiaf.com${route}`,
    lastModified: new Date().toISOString()
  }));

  return [...routes];
}
