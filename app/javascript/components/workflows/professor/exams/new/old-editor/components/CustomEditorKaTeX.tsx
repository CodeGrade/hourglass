// import ReactQuill from 'react-quill';
// import KaTeX from 'katex';

// const Embed = ReactQuill.Quill.import('blots/embed');

// class Formula extends Embed {
//   static create(value: string): HTMLElement {
//     const node = super.create();
//     KaTeX.render(value, node, {
//       throwOnError: false,
//       errorColor: '#f00',
//     });
//     node.setAttribute('data-value', value);
//     return node;
//   }

//   static value(domNode: HTMLElement): string {
//     return domNode.getAttribute('data-value');
//   }

//   html(): string {
//     const { formula } = this.value();
//     return `<span>${formula}</span>`;
//   }
// }
// Formula.blotName = 'formula';
// Formula.className = 'ql-formula';
// Formula.tagName = 'SPAN';

// export default Formula;
