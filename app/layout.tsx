import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <title>Rafaam - AI Language Learning Platform</title>
                <meta
                    name="description"
                    content="A pixel-art styled AI language learning platform"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
                />
                <meta name="theme-color" content="#4f46e5" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="apple-mobile-web-app-title" content="Rafaam" />
                <link rel="icon" type="image/svg+xml" href="/svgs/favicon.svg" />
                <link rel="apple-touch-icon" href="/svgs/favicon.svg" />
            </head>
            <body className="antialiased">{children}</body>
        </html>
    );
}
