import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    a11y: {
      // 'todo' = show violations in the test UI only; switch to 'error' to fail CI
      test: 'todo',
    },
  },
};

export default preview;
