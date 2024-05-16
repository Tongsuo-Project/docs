import React from 'react';
import styles from './styles.module.css';
import Spacer from '../../other/Spacer'
import SectionScroller, {
  SectionInterface,
} from './components/SectionScroller';
import PlainButton from '../../components/buttons/PlainButton'

const sections: SectionInterface[] = [
  {
    code: `
- 符合 GM/T 0028《密码模块安全技术要求》的"软件密码模块安全一级"资质
- 符合 GM/T 0005-2021《随机性检测规范》
`,
    title: '技术合规能力',
    description: '符合 GM/T 0028《密码模块安全技术要求》的"软件密码模块安全一级"资质，符合 GM/T 0005-2021《随机性检测规范》',
    icon: 'zap',
    Svg: require('@site/static/img/feat-1.svg').default,
  },
  {
    code: `
- Bulletproofs (Range)
- [Bulletproofs (R1CS)](https://www.yuque.com/tsdoc/ts/bulletproofs)
`,
    title: '零知识证明（ZKP）',
    description: '零知识证明（ZKP）是一种证明者可以证明自己知道某个信息，而不泄露信息内容的证明方法',
    icon: 'users',
    Svg: require('@site/static/img/feat-2.svg').default,
  },
  {
    code: `
- 中国商用密码算法：SM2、SM3、SM4、[祖冲之](https://www.yuque.com/tsdoc/ts/copzp3)等
- 国际主流算法：ECDSA、RSA、AES、SHA等
- 同态加密算法：[EC-ElGamal](https://www.yuque.com/tsdoc/misc/ec-elgamal)、[Paillier](https://www.yuque.com/tsdoc/misc/rdibad)等
- 后量子密码学*：LAC、NTRU、Saber、Dilithium等
`,
    title: '密码学算法',
    description: '支持多种密码学算法，包括国密算法、国际主流算法、同态加密算法、后量子密码学算法等。',
    icon: 'repeat',
    Svg: require('@site/static/img/feat-3.svg').default,
  },
  {
    code: `
- 支持 GB/T 38636-2020 TLCP 标准，即[双证书国密](https://www.yuque.com/tsdoc/ts/hedgqf)通信协议
- 支持 [RFC 8998](https://datatracker.ietf.org/doc/html/rfc8998)，即 TLS 1.3+ [国密单证书](https://www.yuque.com/tsdoc/ts/grur3x)
- 支持 [QUIC](https://datatracker.ietf.org/doc/html/rfc9000) API
- 支持 [Delegated Credentials](https://www.yuque.com/tsdoc/ts/leubbg) 功能，基于 [draft-ietf-tls-subcerts-10](https://www.ietf.org/archive/id/draft-ietf-tls-subcerts-10.txt)
- 支持 [TLS 证书压缩](https://www.yuque.com/tsdoc/ts/df5pyi)
- 支持紧凑TLS协议*
`,
    title: '安全通信协议',
    description: '支持多种安全通信协议，包括国密通信协议、TLS 1.3、QUIC API、Delegated Credentials功能、TLS证书压缩、紧凑TLS协议等。',
    icon: 'server',
    Svg: require('@site/static/img/feat-4.svg').default,
  },
];

const StraightforwardView: React.FC = () => {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <SectionScroller sections={sections} startIndex={0} />
        <PlainButton
          to={'docs/'}
          name={'注：*号表示正在支持中，了解更多'}
          className={styles.LearnMoreButton}
        />
      </div>
    </div>
  );
};

export default StraightforwardView;
