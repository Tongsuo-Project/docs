import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '技术合规能力',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        符合 GM/T 0028《密码模块安全技术要求》的"软件密码模块安全一级"资质 <br/>
        符合 GM/T 0005-2021《随机性检测规范》
      </>
    ),
  },
  {
    title: '密码学算法',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        中国商用密码算法：SM2、SM3、SM4、祖冲之等 <br/>
        国际主流算法：ECDSA、RSA、AES、SHA等 <br/>
        同态加密算法：EC-ElGamal、Paillier等 <br/>
        后量子密码学*：Kyber、Dilithium等 <br/>
      </>
    ),
  },
  {
    title: '安全通信协议',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        支持GB/T 38636-2020 TLCP标准，即双证书国密通信协议 <br/>
        支持RFC 8998，即TLS 1.3 +国密单证书 <br/>
        支持QUIC API <br/>
        支持Delegated Credentials功能，基于draft-ietf-tls-subcerts-10 <br/>
        支持TLS证书压缩 <br/>
        支持紧凑TLS协议* <br/>
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
