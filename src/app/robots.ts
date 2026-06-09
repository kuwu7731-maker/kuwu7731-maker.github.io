export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/grade/7', '/grade/8', '/grade/9'],
        disallow: ['/admin/', '/api/', '/register', '/login'],
      },
    ],
    sitemap: 'https://shool-forum.example.com/sitemap.xml',
  }
}