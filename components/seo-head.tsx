import Head from "next/head"

interface SEOHeadProps {
  title: string
  description: string
  path: string
}

export default function SEOHead({ title, description, path }: SEOHeadProps) {
  const fullTitle = `${title} | Swot.works Tools`
  const url = `https://swot-works-tools.vercel.app${path}`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Swot.works Tools" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}
