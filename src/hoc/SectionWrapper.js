import React from 'react';

const SectionWrapper = (Component, idName) => function HOC() {
  return (
    <section id={idName}>
      <Component />
    </section>
  );
};

export default SectionWrapper;