import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import OtherFeaturesView from '../components/OtherFeaturesView';
import StraightforwardView from '../components/StraightforwardView';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        {/* <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading> */}
        <h1 className="hero__logo">
            <img src="/img/logo.png" alt="logo" width="500" />
        </h1>
        <div className={styles.social}>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=Tongsuo-Project&amp;repo=Tongsuo&amp;type=watch&amp;count=true"
            height="20"
            width="118"
            frameBorder="0"
            scrolling="0"
            style={{ width: "118px", height: "20px" }}
          ></iframe>
        </div>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons + " " + styles.buttonDiv}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            快速开始 🚀
          </Link>
        </div>
      </div>
    </header>

  );
}

function OpenAtomBanner() {
  return (
    <div className={clsx("hero", styles.hero)}>
        <div className="container text--center">
          <h3 className="hero__subtitle">
            铜锁/Tongsuo 是由
            <a href="https://openatom.org/">开放原子开源基金会（OpenAtom Foundation）</a>
            孵化及运营的开源项目
          </h3>
          <h1 className="hero__logo">
            <img src="/img/openatom-logo.png" alt="logo" width="300" />
        </h1>
        </div>
      </div>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        {/* <HomepageFeatures /> */}
        <StraightforwardView />
        <OtherFeaturesView />
        <OpenAtomBanner />
      </main>
    </Layout>
  );
}
