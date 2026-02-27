import { Element } from '@craftjs/core';
import React from 'react';

import { Container } from '../selectors/Container/Container';
import { Text } from '../selectors/Text/Text';
import { ButtonOnlyZone } from '../selectors/ButtonOnlyZone/ButtonOnlyZone';
import { VideoDropZone } from '../selectors/VideoDropZone/VideoDropZone';
import { RequiredButtonZone } from '../selectors/RequiredButtonZone/RequiredButtonZone';

export const ProgrammaticSection = () => {
  return (
    <Element
      canvas
      is={Container}
      background={{
        r: 234,
        g: 245,
        b: 245,
        a: 1,
      }}
      flexDirection="column"
      width="100%"
      height="auto"
      padding={['40', '40', '40', '40']}
      margin={['0', '0', '40', '0']}
      custom={{ displayName: 'Programmatic' }}
    >
      <Element
        canvas
        background={{
          r: 76,
          g: 78,
          b: 78,
          a: 0,
        }}
        is={Container}
        flexDirection="column"
        margin={['0,', '0', '20', '0']}
        width="100%"
        height="auto"
        custom={{ displayName: 'Heading' }}
      >
        <Text
          color={{
            r: '46',
            g: '47',
            b: '47',
            a: '1',
          }}
          fontSize="23"
          text="Programmatic drag &amp; drop"
        ></Text>
        <Text
          fontSize="14"
          fontWeight="400"
          text="Govern what goes in and out of your components"
        ></Text>
      </Element>
      <Element
        canvas
        background={{
          r: 76,
          g: 78,
          b: 78,
          a: 0,
        }}
        is={Container}
        flexDirection="row"
        margin={['30', '0', '0', '0']}
        width="100%"
        height="auto"
        custom={{ displayName: 'Content' }}
      >
        <Element
          canvas
          background={{
            r: 0,
            g: 0,
            b: 0,
            a: 0,
          }}
          is={Container}
          padding={['0', '20', '0', '0']}
          flexDirection="row"
          width="45%"
          custom={{ displayName: 'Left' }}
        >
          <ButtonOnlyZone
            background={{
              r: 119,
              g: 219,
              b: 165,
              a: 1,
            }}
            height="auto"
            width="100%"
            padding={['20', '20', '20', '20']}
            margin={['0', '0', '0', '0']}
            shadow={40}
          />
        </Element>
        <Element
          canvas
          background={{
            r: 0,
            g: 0,
            b: 0,
            a: 0,
          }}
          is={Container}
          padding={['0', '0', '0', '20']}
          flexDirection="column"
          width="55%"
          custom={{ displayName: 'Right' }}
        >
          <VideoDropZone
            background={{
              r: 108,
              g: 126,
              b: 131,
              a: 1,
            }}
            height="125px"
            width="100%"
            padding={['0', '0', '0', '20']}
            margin={['0', '0', '0', '0']}
            shadow={40}
            flexDirection="row"
            alignItems="center"
          />
          <RequiredButtonZone
            background={{
              r: 134,
              g: 187,
              b: 201,
              a: 1,
            }}
            height="auto"
            width="100%"
            padding={['20', '20', '20', '20']}
            margin={['20', '0', '0', '0']}
            shadow={40}
            flexDirection="column"
          />
        </Element>
      </Element>
    </Element>
  );
};

ProgrammaticSection.craft = {
  displayName: 'Programmatic Section',
};
