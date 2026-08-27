import './globals.css';

export const metadata = { title: 'PM Interview Prep Assistant' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="topbar">
          <a href="/" className="brand">PM Interview Prep</a>
          <nav>
            <a href="/documents">Add material</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
