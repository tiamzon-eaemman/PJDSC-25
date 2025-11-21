import Document, {Html, Head, Main, NextScript} from "next/document";

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <meta name="theme-color" content="#0ea5e9" />
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="icon" href="/icon-192.png" sizes="192x192" />
                    <link rel="apple-touch-icon" href="/icon-192.png" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content="SAGIP" />
                </Head>
                <body className="font-sans antialiased">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument