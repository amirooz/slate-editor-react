import { Value } from 'slate';

const initialValue = Value.fromJSON({
  object: "value",
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: 'A line of text in a paragraph.',
          },
        ],
      },
    ],
  },
});

export default initialValue;
