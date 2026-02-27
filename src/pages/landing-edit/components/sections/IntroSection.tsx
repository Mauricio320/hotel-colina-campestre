import { Element } from '@craftjs/core';
import React from 'react';

import { Container } from '../selectors/Container/Container';
import { Text } from '../selectors/Text/Text';

// Generate unique ID helper
const uid = () => Math.random().toString(36).substring(2, 9);

export const IntroSection = () => {
  const id = uid();
  return (
    <Element
      canvas
      id={`intro-${id}`}
      is={Container}
      flexDirection="row"
      width="100%"
      height="auto"
      padding={['40', '40', '40', '40']}
      margin={['0', '0', '40', '0']}
      custom={{ displayName: 'Introduction' }}
    >
      <Element
        canvas
        id={`intro-h-${id}`}
        is={Container}
        width="40%"
        height="100%"
        padding={['0', '20', '0', '20']}
        custom={{ displayName: 'Heading' }}
      >
        <Text
          fontSize="23"
          fontWeight="400"
          text="Craft.js is a React framework for building powerful &amp; feature-rich drag-n-drop page editors."
        ></Text>
      </Element>
      <Element
        canvas
        id={`intro-d-${id}`}
        is={Container}
        width="60%"
        height="100%"
        padding={['0', '20', '0', '20']}
        custom={{ displayName: 'Description' }}
      >
        <Text
          fontSize="14"
          fontWeight="400"
          text="Everything you see here, including the editor, itself is made of React components. Craft.js comes only with the building blocks for a page editor; it provides a drag-n-drop system and handles the way user components should be rendered, updated and moved, among other things. <br /> <br /> You control the way your editor looks and behave."
        ></Text>
      </Element>
    </Element>
  );
};

IntroSection.craft = {
  displayName: 'Intro Section',
};
