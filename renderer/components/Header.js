import Head from "next/head";

export default ({ title = "This is the default title" }) => (
  <Head>
    <meta charSet="utf-8" />
    <title>{title}</title>

    <link rel="stylesheet" href="/static/css/antd.min.css" />
  </Head>
);
