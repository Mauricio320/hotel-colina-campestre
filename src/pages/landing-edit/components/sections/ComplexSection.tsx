import { Element } from '@craftjs/core';
import React from 'react';

import { Container } from '../selectors/Container/Container';
import { Text } from '../selectors/Text/Text';

// Generate unique ID helper
const uid = () => Math.random().toString(36).substring(2, 9);

export const ComplexSection = () => {
  const id = uid();
  return (
    <Element
      canvas
      id={`complex-${id}`}
      is={Container}
      background={{ r: 39, g: 41, b: 41, a: 1 }}
      flexDirection="column"
      width="100%"
      height="auto"
      padding={['40', '40', '40', '40']}
      margin={['0', '0', '40', '0']}
      custom={{ displayName: 'ComplexSection' }}
    >
      <Element
        canvas
        id={`complex-w-${id}`}
        background={{ r: 76, g: 78, b: 78, a: 0 }}
        is={Container}
        flexDirection="row"
        margin={['0', '0', '0', '0']}
        width="100%"
        height="auto"
        alignItems="center"
        custom={{ displayName: 'Wrapper' }}
      >
        <Element
          canvas
          id={`complex-s-${id}`}
          background={{ r: 0, g: 0, b: 0, a: 0 }}
          is={Container}
          alignItems="center"
          padding={['0', '0', '0', '0']}
          flexDirection="row"
          width="350px"
          height="250px"
          custom={{ displayName: 'Square' }}
        >
          <Element
            canvas
            id={`complex-o-${id}`}
            is={Container}
            justifyContent="center"
            alignItems="center"
            background={{ r: 76, g: 78, b: 78, a: 1 }}
            shadow={25}
            width="90%"
            height="90%"
            padding={['10', '20', '10', '20']}
            custom={{ displayName: 'Outer' }}
          >
            <Element
              canvas
              id={`complex-m-${id}`}
              is={Container}
              justifyContent="center"
              alignItems="center"
              background={{ r: 76, g: 78, b: 78, a: 1 }}
              shadow={50}
              width="80%"
              height="80%"
              padding={['10', '20', '10', '20']}
              custom={{ displayName: 'Middle' }}
            >
              <Element
                canvas
                id={`complex-i-${id}`}
                is={Container}
                justifyContent="center"
                alignItems="center"
                background={{ r: 76, g: 78, b: 78, a: 1 }}
                shadow={50}
                width="60%"
                height="60%"
                padding={['10', '20', '10', '20']}
                custom={{ displayName: 'Inner' }}
              />
            </Element>
          </Element>
        </Element>
        <Element
          canvas
          id={`complex-c-${id}`}
          background={{ r: 0, g: 0, b: 0, a: 0 }}
          is={Container}
          padding={['0', '0', '0', '20']}
          flexDirection="column"
          width="55%"
          height="100%"
          fillSpace="yes"
          custom={{ displayName: 'Content' }}
        >
          <Text
            color={{ r: '255', g: '255', b: '255', a: '1' }}
            margin={['0', '0', '18', '0']}
            fontSize="20"
            text="Design complex components"
          ></Text>
          <Text
            color={{ r: '255', g: '255', b: '255', a: '0.8' }}
            fontSize="14"
            fontWeight="400"
            text="You can define areas within your React component which users can drop other components into. <br/><br />You can even design how the component should be edited — content editable, drag to resize, have inputs on toolbars — anything really."
          ></Text>
        </Element>
      </Element>
    </Element>
  );
};

ComplexSection.craft = {
  displayName: 'Complex Section',
};
