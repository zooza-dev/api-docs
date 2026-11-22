import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import ChatButton from '@site/src/components/ChatButton';
import styles from './styles.module.css';

// Adds a "tell us" line under every docs page (spec DOC-20261119-001).
export default function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      <div className={styles.feedback}>
        <span>Something unclear or wrong on this page?</span>
        <ChatButton template="page" note={false}>
          Tell us
        </ChatButton>
      </div>
    </>
  );
}
