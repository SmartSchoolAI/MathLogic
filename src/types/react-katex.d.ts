declare module 'react-katex' {
  import * as React from 'react';

  export interface KatexProps {
    math?: string;
    children?: string;
    renderError?: (error: Error) => React.ReactNode;
    errorColor?: string;
  }

  export class InlineMath extends React.Component<KatexProps> {}
  export class BlockMath extends React.Component<KatexProps> {}
}
