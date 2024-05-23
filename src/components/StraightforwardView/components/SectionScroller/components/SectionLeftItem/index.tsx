import React from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

export type Props = {
  forwardRef?: React.LegacyRef<HTMLDivElement>;
  code: string;
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  active: boolean;
  style?: any;
};

const SectionLeftItem: React.FC<Props> = (props) => {
  console.log('props', props);
  const { code, title, Svg, active, forwardRef, style } = props;
  return (
    <div
      style={style}
      ref={forwardRef}
      className={clsx(styles.Container, {
        [styles.Container_Active]: active,
      })}>
      <Feature title={title} Svg={Svg} description={code} />
    </div>
  );
};

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: string;
};

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={styles.Container}>
    <div className={clsx('row')}>
      <div className={clsx('col col--8')}>
        <div className="padding-horiz--md">
          <h3>{title}</h3>
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </div>
      <div className={clsx('col col--4')}>
          <Svg className={styles.featureSvg} role="img" />
      </div>
    </div>
    </div>
  );
}

export default SectionLeftItem;
