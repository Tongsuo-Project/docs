import React from 'react';
import styles from './styles.module.css';
import Cards, { CardInterface } from './components/Cards';

const cards: CardInterface[] = [
  {
    title: '高级应用安全密码模块（Linux 版）',
    description:
      '证书编号：GM003312220240523',
    to: '',
    imagePath: 'img/validation-linux-lv2.jpeg',
  },
  {
    title: 'Android 移动端软件密码模块',
    description:
      '证书编号：GM003312220220743',
    to: 'https://www.yuque.com/tsdoc/misc/st247r05s8b5dtct',
    imagePath: 'img/validation-android.png',
  },
  {
    title: 'IOS端软件密码模块',
    description:
      '证书编号：GM003312220230052',
    to: 'https://www.yuque.com/tsdoc/misc/st247r05s8b5dtct',
    imagePath: 'img/validation-ios.png',
  },
  {
    title: '应用安全软件密码模块（Linux版）',
    description:
      '证书编号：GM003312220230044',
    to: 'https://www.yuque.com/tsdoc/misc/st247r05s8b5dtct',
    imagePath: 'img/validation-linux.png',
  },
];

const OtherFeaturesView: React.FC = () => {
  return (
    <div className={styles.Container}>
      <h2 className="hero__subtitle">
        铜锁密码产品认证证书
      </h2>
      <Cards cards={cards} />
    </div>
  );
};

export default OtherFeaturesView;
