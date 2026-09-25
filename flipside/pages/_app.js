import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Flipside</title>
        <meta name="description" content="Submit any content and get its strongest counterargument, steelmanned, plus a visual opposite." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://flipside-one.vercel.app/" />
        <meta property="og:title" content="Flipside" />
        <meta property="og:description" content="Submit any content and get its strongest counterargument, steelmanned, plus a visual opposite." />
        <meta property="og:image" content="https://flipside-one.vercel.app/op1.image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="627" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
