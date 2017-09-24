import Head from "next/head";

export default ({ title = "This is the default title" }) => (
  <Head>
    <title>{title}</title>

    <link rel="stylesheet" href="/static/css/photon.min.css" />
  </Head>
);
